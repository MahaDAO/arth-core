import assert from "assert";

import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { Log } from "@ethersproject/abstract-provider";
import { ErrorCode } from "@ethersproject/logger";
import { Transaction } from "@ethersproject/transactions";

import {
  CollateralGainTransferDetails,
  Decimal,
  Decimalish,
  LiquidationDetails,
  ARTHReceipt,
  ARTH_MINIMUM_DEBT,
  ARTH_MINIMUM_NET_DEBT,
  MinedReceipt,
  PopulatableARTH,
  PopulatedARTHTransaction,
  PopulatedRedemption,
  RedemptionDetails,
  SentARTHTransaction,
  StabilityDepositChangeDetails,
  StabilityPoolGainsWithdrawalDetails,
  Trove,
  TroveAdjustmentDetails,
  TroveAdjustmentParams,
  TroveClosureDetails,
  TroveCreationDetails,
  TroveCreationParams,
  TroveWithPendingRedistribution,
  _failedReceipt,
  _normalizeTroveAdjustment,
  _normalizeTroveCreation,
  _pendingReceipt,
  _successfulReceipt
} from "@mahadao/arth-base";

import {
  EthersPopulatedTransaction,
  EthersTransactionOverrides,
  EthersTransactionReceipt,
  EthersTransactionResponse
} from "./types";

import {
  EthersARTHConnection,
  _getContracts,
  _getProvider,
  _requireAddress,
  _requireSigner
} from "./EthersARTHConnection";

import { decimalify, promiseAllValues } from "./_utils";
import { _priceFeedIsTestnet } from "./contracts";
import { logsToString } from "./parseLogs";
import { ReadableEthersARTH } from "./ReadableEthersARTH";

const bigNumberMax = (a: BigNumber, b?: BigNumber) => (b?.gt(a) ? b : a);

// With 70 iterations redemption costs about ~10M gas, and each iteration accounts for ~138k more
/** @internal */
export const _redeemMaxIterations = 70;

const defaultBorrowingRateSlippageTolerance = Decimal.from(0.005); // 0.5%
const defaultRedemptionRateSlippageTolerance = Decimal.from(0.001); // 0.1%
const defaultBorrowingFeeDecayToleranceMinutes = 10;

const noDetails = () => undefined;

const compose =
  <T, U, V>(f: (_: U) => V, g: (_: T) => U) =>
  (_: T) =>
    f(g(_));

const id = <T>(t: T) => t;

// Takes ~6-7K (use 10K to be safe) to update lastFeeOperationTime, but the cost of calculating the
// decayed baseRate increases logarithmically with time elapsed since the last update.
const addGasForBaseRateUpdate =
  (maxMinutesSinceLastUpdate = 10) =>
  (gas: BigNumber) =>
    gas.add(10000 + 1414 * Math.ceil(Math.log2(maxMinutesSinceLastUpdate + 1)));

// First traversal in ascending direction takes ~50K, then ~13.5K per extra step.
// 80K should be enough for 3 steps, plus some extra to be safe.
const addGasForPotentialListTraversal = (gas: BigNumber) => gas.add(80000);

const addGasForMAHAIssuance = (gas: BigNumber) => gas.add(50000);

// To get the best entropy available, we'd do something like:
//
// const bigRandomNumber = () =>
//   BigNumber.from(
//     `0x${Array.from(crypto.getRandomValues(new Uint32Array(8)))
//       .map(u32 => u32.toString(16).padStart(8, "0"))
//       .join("")}`
//   );
//
// However, Window.crypto is browser-specific. Since we only use this for randomly picking Troves
// during the search for hints, Math.random() will do fine, too.
//
// This returns a random integer between 0 and Number.MAX_SAFE_INTEGER
const randomInteger = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

// Maximum number of trials to perform in a single getApproxHint() call. If the number of trials
// required to get a statistically "good" hint is larger than this, the search for the hint will
// be broken up into multiple getApproxHint() calls.
//
// This should be low enough to work with popular public Ethereum providers like Infura without
// triggering any fair use limits.
const maxNumberOfTrialsAtOnce = 2500;

function* generateTrials(totalNumberOfTrials: number) {
  assert(Number.isInteger(totalNumberOfTrials) && totalNumberOfTrials > 0);

  while (totalNumberOfTrials) {
    const numberOfTrials = Math.min(totalNumberOfTrials, maxNumberOfTrialsAtOnce);
    yield numberOfTrials;

    totalNumberOfTrials -= numberOfTrials;
  }
}

/** @internal */
export enum _RawErrorReason {
  TRANSACTION_FAILED = "transaction failed",
  TRANSACTION_CANCELLED = "cancelled",
  TRANSACTION_REPLACED = "replaced",
  TRANSACTION_REPRICED = "repriced"
}

const transactionReplacementReasons: unknown[] = [
  _RawErrorReason.TRANSACTION_CANCELLED,
  _RawErrorReason.TRANSACTION_REPLACED,
  _RawErrorReason.TRANSACTION_REPRICED
];

interface RawTransactionFailedError extends Error {
  code: ErrorCode.CALL_EXCEPTION;
  reason: _RawErrorReason.TRANSACTION_FAILED;
  transactionHash: string;
  transaction: Transaction;
  receipt: EthersTransactionReceipt;
}

/** @internal */
export interface _RawTransactionReplacedError extends Error {
  code: ErrorCode.TRANSACTION_REPLACED;
  reason:
    | _RawErrorReason.TRANSACTION_CANCELLED
    | _RawErrorReason.TRANSACTION_REPLACED
    | _RawErrorReason.TRANSACTION_REPRICED;
  cancelled: boolean;
  hash: string;
  replacement: EthersTransactionResponse;
  receipt: EthersTransactionReceipt;
}

const hasProp = <T, P extends string>(o: T, p: P): o is T & { [_ in P]: unknown } => p in o;

const isTransactionFailedError = (error: Error): error is RawTransactionFailedError =>
  hasProp(error, "code") &&
  error.code === ErrorCode.CALL_EXCEPTION &&
  hasProp(error, "reason") &&
  error.reason === _RawErrorReason.TRANSACTION_FAILED;

const isTransactionReplacedError = (error: Error): error is _RawTransactionReplacedError =>
  hasProp(error, "code") &&
  error.code === ErrorCode.TRANSACTION_REPLACED &&
  hasProp(error, "reason") &&
  transactionReplacementReasons.includes(error.reason);

/**
 * Thrown when a transaction is cancelled or replaced by a different transaction.
 *
 * @public
 */
export class EthersTransactionCancelledError extends Error {
  readonly rawReplacementReceipt: EthersTransactionReceipt;
  readonly rawError: Error;

  /** @internal */
  constructor(rawError: _RawTransactionReplacedError) {
    assert(rawError.reason !== _RawErrorReason.TRANSACTION_REPRICED);

    super(`Transaction ${rawError.reason}`);
    this.name = "TransactionCancelledError";
    this.rawReplacementReceipt = rawError.receipt;
    this.rawError = rawError;
  }
}

/**
 * A transaction that has already been sent.
 *
 * @remarks
 * Returned by {@link SendableEthersARTH} functions.
 *
 * @public
 */
export class SentEthersARTHTransaction<T = unknown>
  implements
    SentARTHTransaction<EthersTransactionResponse, ARTHReceipt<EthersTransactionReceipt, T>>
{
  /** Ethers' representation of a sent transaction. */
  readonly rawSentTransaction: EthersTransactionResponse;

  private readonly _connection: EthersARTHConnection;
  private readonly _parse: (rawReceipt: EthersTransactionReceipt) => T;

  /** @internal */
  constructor(
    rawSentTransaction: EthersTransactionResponse,
    connection: EthersARTHConnection,
    parse: (rawReceipt: EthersTransactionReceipt) => T
  ) {
    this.rawSentTransaction = rawSentTransaction;
    this._connection = connection;
    this._parse = parse;
  }

  private _receiptFrom(rawReceipt: EthersTransactionReceipt | null) {
    return rawReceipt
      ? rawReceipt.status
        ? _successfulReceipt(rawReceipt, this._parse(rawReceipt), () =>
            logsToString(rawReceipt, _getContracts(this._connection))
          )
        : _failedReceipt(rawReceipt)
      : _pendingReceipt;
  }

  private async _waitForRawReceipt(confirmations?: number) {
    try {
      return await this.rawSentTransaction.wait(confirmations);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (isTransactionFailedError(error)) {
          return error.receipt;
        }

        if (isTransactionReplacedError(error)) {
          if (error.cancelled) {
            throw new EthersTransactionCancelledError(error);
          } else {
            return error.receipt;
          }
        }
      }

      throw error;
    }
  }

  /** {@inheritDoc @mahadao/arth-base#SentARTHTransaction.getReceipt} */
  async getReceipt(): Promise<ARTHReceipt<EthersTransactionReceipt, T>> {
    return this._receiptFrom(await this._waitForRawReceipt(0));
  }

  /**
   * {@inheritDoc @mahadao/arth-base#SentARTHTransaction.waitForReceipt}
   *
   * @throws
   * Throws {@link EthersTransactionCancelledError} if the transaction is cancelled or replaced.
   */
  async waitForReceipt(): Promise<MinedReceipt<EthersTransactionReceipt, T>> {
    const receipt = this._receiptFrom(await this._waitForRawReceipt());

    assert(receipt.status !== "pending");
    return receipt;
  }
}

/**
 * Optional parameters of a transaction that borrows ARTH.
 *
 * @public
 */
export interface BorrowingOperationOptionalParams {
  /**
   * Maximum acceptable {@link @mahadao/arth-base#Fees.borrowingRate | borrowing rate}
   * (default: current borrowing rate plus 0.5%).
   */
  maxBorrowingRate?: Decimalish;

  /**
   * Control the amount of extra gas included attached to the transaction.
   *
   * @remarks
   * Transactions that borrow ARTH must pay a variable borrowing fee, which is added to the Trove's
   * debt. This fee increases whenever a redemption occurs, and otherwise decays exponentially.
   * Due to this decay, a Trove's collateral ratio can end up being higher than initially calculated
   * if the transaction is pending for a long time. When this happens, the backend has to iterate
   * over the sorted list of Troves to find a new position for the Trove, which costs extra gas.
   *
   * The SDK can estimate how much the gas costs of the transaction may increase due to this decay,
   * and can include additional gas to ensure that it will still succeed, even if it ends up pending
   * for a relatively long time. This parameter specifies the length of time that should be covered
   * by the extra gas.
   *
   * Default: 10 minutes.
   */
  borrowingFeeDecayToleranceMinutes?: number;
}

const normalizeBorrowingOperationOptionalParams = (
  maxBorrowingRateOrOptionalParams: Decimalish | BorrowingOperationOptionalParams | undefined,
  currentBorrowingRate: Decimal | undefined
): {
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
} => {
  if (maxBorrowingRateOrOptionalParams === undefined) {
    return {
      maxBorrowingRate:
        currentBorrowingRate?.add(defaultBorrowingRateSlippageTolerance) ?? Decimal.ZERO,
      borrowingFeeDecayToleranceMinutes: defaultBorrowingFeeDecayToleranceMinutes
    };
  } else if (
    typeof maxBorrowingRateOrOptionalParams === "number" ||
    typeof maxBorrowingRateOrOptionalParams === "string" ||
    maxBorrowingRateOrOptionalParams instanceof Decimal
  ) {
    return {
      maxBorrowingRate: Decimal.from(maxBorrowingRateOrOptionalParams),
      borrowingFeeDecayToleranceMinutes: defaultBorrowingFeeDecayToleranceMinutes
    };
  } else {
    const { maxBorrowingRate, borrowingFeeDecayToleranceMinutes } = maxBorrowingRateOrOptionalParams;

    return {
      maxBorrowingRate:
        maxBorrowingRate !== undefined
          ? Decimal.from(maxBorrowingRate)
          : currentBorrowingRate?.add(defaultBorrowingRateSlippageTolerance) ?? Decimal.ZERO,

      borrowingFeeDecayToleranceMinutes:
        borrowingFeeDecayToleranceMinutes ?? defaultBorrowingFeeDecayToleranceMinutes
    };
  }
};

/**
 * A transaction that has been prepared for sending.
 *
 * @remarks
 * Returned by {@link PopulatableEthersARTH} functions.
 *
 * @public
 */
export class PopulatedEthersARTHTransaction<T = unknown>
  implements PopulatedARTHTransaction<EthersPopulatedTransaction, SentEthersARTHTransaction<T>>
{
  /** Unsigned transaction object populated by Ethers. */
  readonly rawPopulatedTransaction: EthersPopulatedTransaction;

  /**
   * Extra gas added to the transaction's `gasLimit` on top of the estimated minimum requirement.
   *
   * @remarks
   * Gas estimation is based on blockchain state at the latest block. However, most transactions
   * stay in pending state for several blocks before being included in a block. This may increase
   * the actual gas requirements of certain ARTH transactions by the time they are eventually
   * mined, therefore the ARTH SDK increases these transactions' `gasLimit` by default (unless
   * `gasLimit` is {@link EthersTransactionOverrides | overridden}).
   *
   * Note: even though the SDK includes gas headroom for many transaction types, currently this
   * property is only implemented for {@link PopulatableEthersARTH.openTrove | openTrove()},
   * {@link PopulatableEthersARTH.adjustTrove | adjustTrove()} and its aliases.
   */
  readonly gasHeadroom?: number;

  private readonly _connection: EthersARTHConnection;
  private readonly _parse: (rawReceipt: EthersTransactionReceipt) => T;

  /** @internal */
  constructor(
    rawPopulatedTransaction: EthersPopulatedTransaction,
    connection: EthersARTHConnection,
    parse: (rawReceipt: EthersTransactionReceipt) => T,
    gasHeadroom?: number
  ) {
    this.rawPopulatedTransaction = rawPopulatedTransaction;
    this._connection = connection;
    this._parse = parse;

    if (gasHeadroom !== undefined) {
      this.gasHeadroom = gasHeadroom;
    }
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatedARTHTransaction.send} */
  async send(): Promise<SentEthersARTHTransaction<T>> {
    return new SentEthersARTHTransaction(
      await _requireSigner(this._connection).sendTransaction(this.rawPopulatedTransaction),
      this._connection,
      this._parse
    );
  }
}

/**
 * {@inheritDoc @mahadao/arth-base#PopulatedRedemption}
 *
 * @public
 */
export class PopulatedEthersRedemption
  extends PopulatedEthersARTHTransaction<RedemptionDetails>
  implements
    PopulatedRedemption<
      EthersPopulatedTransaction,
      EthersTransactionResponse,
      EthersTransactionReceipt
    >
{
  /** {@inheritDoc @mahadao/arth-base#PopulatedRedemption.attemptedARTHAmount} */
  readonly attemptedARTHAmount: Decimal;

  /** {@inheritDoc @mahadao/arth-base#PopulatedRedemption.redeemableARTHAmount} */
  readonly redeemableARTHAmount: Decimal;

  /** {@inheritDoc @mahadao/arth-base#PopulatedRedemption.isTruncated} */
  readonly isTruncated: boolean;

  private readonly _increaseAmountByMinimumNetDebt?: (
    maxRedemptionRate?: Decimalish
  ) => Promise<PopulatedEthersRedemption>;

  /** @internal */
  constructor(
    rawPopulatedTransaction: EthersPopulatedTransaction,
    connection: EthersARTHConnection,
    attemptedARTHAmount: Decimal,
    redeemableARTHAmount: Decimal,
    increaseAmountByMinimumNetDebt?: (
      maxRedemptionRate?: Decimalish
    ) => Promise<PopulatedEthersRedemption>
  ) {
    const { troveManager } = _getContracts(connection);

    super(
      rawPopulatedTransaction,
      connection,

      ({ logs }) =>
        troveManager
          .extractEvents(logs, "Redemption")
          .map(({ args: { _ETHSent, _ETHFee, _actualARTHAmount, _attemptedARTHAmount } }) => ({
            attemptedARTHAmount: decimalify(_attemptedARTHAmount),
            actualARTHAmount: decimalify(_actualARTHAmount),
            collateralTaken: decimalify(_ETHSent),
            fee: decimalify(_ETHFee)
          }))[0]
    );

    this.attemptedARTHAmount = attemptedARTHAmount;
    this.redeemableARTHAmount = redeemableARTHAmount;
    this.isTruncated = redeemableARTHAmount.lt(attemptedARTHAmount);
    this._increaseAmountByMinimumNetDebt = increaseAmountByMinimumNetDebt;
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatedRedemption.increaseAmountByMinimumNetDebt} */
  increaseAmountByMinimumNetDebt(
    maxRedemptionRate?: Decimalish
  ): Promise<PopulatedEthersRedemption> {
    if (!this._increaseAmountByMinimumNetDebt) {
      throw new Error(
        "PopulatedEthersRedemption: increaseAmountByMinimumNetDebt() can " +
          "only be called when amount is truncated"
      );
    }

    return this._increaseAmountByMinimumNetDebt(maxRedemptionRate);
  }
}

/** @internal */
export interface _TroveChangeWithFees<T> {
  params: T;
  newTrove: Trove;
  fee: Decimal;
}

/**
 * Ethers-based implementation of {@link @mahadao/arth-base#PopulatableARTH}.
 *
 * @public
 */
export class PopulatableEthersARTH
  implements
    PopulatableARTH<EthersTransactionReceipt, EthersTransactionResponse, EthersPopulatedTransaction>
{
  private readonly _readable: ReadableEthersARTH;

  constructor(readable: ReadableEthersARTH) {
    this._readable = readable;
  }

  private _wrapSimpleTransaction(
    rawPopulatedTransaction: EthersPopulatedTransaction
  ): PopulatedEthersARTHTransaction<void> {
    return new PopulatedEthersARTHTransaction(
      rawPopulatedTransaction,
      this._readable.connection,
      noDetails
    );
  }

  private _wrapTroveChangeWithFees<T>(
    params: T,
    rawPopulatedTransaction: EthersPopulatedTransaction,
    gasHeadroom?: number
  ): PopulatedEthersARTHTransaction<_TroveChangeWithFees<T>> {
    const { borrowerOperations } = _getContracts(this._readable.connection);

    return new PopulatedEthersARTHTransaction(
      rawPopulatedTransaction,
      this._readable.connection,

      ({ logs }) => {
        const [newTrove] = borrowerOperations
          .extractEvents(logs, "TroveUpdated")
          .map(({ args: { _coll, _debt } }) => {
            return new Trove(decimalify(_coll), decimalify(_debt));
          });

        const [fee] = borrowerOperations
          .extractEvents(logs, "ARTHBorrowingFeePaid")
          .map(({ args: { _ARTHFee } }) => {
            return decimalify(_ARTHFee);
          });
        return {
          params,
          newTrove,
          fee
        };
      },

      gasHeadroom
    );
  }

  private async _wrapTroveClosure(
    rawPopulatedTransaction: EthersPopulatedTransaction
  ): Promise<PopulatedEthersARTHTransaction<TroveClosureDetails>> {
    const { activePool, arthToken } = _getContracts(this._readable.connection);

    return new PopulatedEthersARTHTransaction(
      rawPopulatedTransaction,
      this._readable.connection,

      ({ logs, from: userAddress }) => {
        const [repayARTH] = arthToken
          .extractEvents(logs, "Transfer")
          .filter(({ args: { from, to } }) => from === userAddress && to === AddressZero)
          .map(({ args: { value } }) => decimalify(value));

        const [withdrawCollateral] = activePool
          .extractEvents(logs, "EtherSent")
          .filter(({ args: { _to } }) => _to === userAddress)
          .map(({ args: { _amount } }) => decimalify(_amount));

        return {
          params: repayARTH.nonZero ? { withdrawCollateral, repayARTH } : { withdrawCollateral }
        };
      }
    );
  }

  private _wrapLiquidation(
    rawPopulatedTransaction: EthersPopulatedTransaction
  ): PopulatedEthersARTHTransaction<LiquidationDetails> {
    const { troveManager } = _getContracts(this._readable.connection);

    return new PopulatedEthersARTHTransaction(
      rawPopulatedTransaction,
      this._readable.connection,

      ({ logs }) => {
        const liquidatedAddresses = troveManager
          .extractEvents(logs, "TroveLiquidated")
          .map(({ args: { _borrower } }) => _borrower);

        const [totals] = troveManager
          .extractEvents(logs, "Liquidation")
          .map(
            ({
              args: { _ARTHGasCompensation, _collGasCompensation, _liquidatedColl, _liquidatedDebt }
            }) => ({
              collateralGasCompensation: decimalify(_collGasCompensation),
              arthGasCompensation: decimalify(_ARTHGasCompensation),
              totalLiquidated: new Trove(decimalify(_liquidatedColl), decimalify(_liquidatedDebt))
            })
          );

        return {
          liquidatedAddresses,
          ...totals
        };
      }
    );
  }

  private _extractStabilityPoolGainsWithdrawalDetails(
    logs: Log[]
  ): StabilityPoolGainsWithdrawalDetails {
    const { stabilityPool } = _getContracts(this._readable.connection);

    const [newARTHDeposit] = stabilityPool
      .extractEvents(logs, "UserDepositChanged")
      .map(({ args: { _newDeposit } }) => decimalify(_newDeposit));

    const [[collateralGain, arthLoss]] = stabilityPool
      .extractEvents(logs, "ETHGainWithdrawn")
      .map(({ args: { _ETH, _ARTHLoss } }) => [decimalify(_ETH), decimalify(_ARTHLoss)]);

    const [mahaReward] = stabilityPool
      .extractEvents(logs, "MAHAPaidToDepositor")
      .map(({ args: { _MAHA } }) => decimalify(_MAHA));

    return {
      arthLoss,
      newARTHDeposit,
      collateralGain,
      mahaReward
    };
  }

  private _wrapStabilityPoolGainsWithdrawal(
    rawPopulatedTransaction: EthersPopulatedTransaction
  ): PopulatedEthersARTHTransaction<StabilityPoolGainsWithdrawalDetails> {
    return new PopulatedEthersARTHTransaction(
      rawPopulatedTransaction,
      this._readable.connection,
      ({ logs }) => this._extractStabilityPoolGainsWithdrawalDetails(logs)
    );
  }

  private _wrapStabilityDepositTopup(
    change: { depositARTH: Decimal },
    rawPopulatedTransaction: EthersPopulatedTransaction
  ): PopulatedEthersARTHTransaction<StabilityDepositChangeDetails> {
    return new PopulatedEthersARTHTransaction(
      rawPopulatedTransaction,
      this._readable.connection,

      ({ logs }) => ({
        ...this._extractStabilityPoolGainsWithdrawalDetails(logs),
        change
      })
    );
  }

  private async _wrapStabilityDepositWithdrawal(
    rawPopulatedTransaction: EthersPopulatedTransaction
  ): Promise<PopulatedEthersARTHTransaction<StabilityDepositChangeDetails>> {
    const { stabilityPool, arthToken } = _getContracts(this._readable.connection);

    return new PopulatedEthersARTHTransaction(
      rawPopulatedTransaction,
      this._readable.connection,

      ({ logs, from: userAddress }) => {
        const gainsWithdrawalDetails = this._extractStabilityPoolGainsWithdrawalDetails(logs);

        const [withdrawARTH] = arthToken
          .extractEvents(logs, "Transfer")
          .filter(({ args: { from, to } }) => from === stabilityPool.address && to === userAddress)
          .map(({ args: { value } }) => decimalify(value));

        return {
          ...gainsWithdrawalDetails,
          change: { withdrawARTH, withdrawAllARTH: gainsWithdrawalDetails.newARTHDeposit.isZero }
        };
      }
    );
  }

  private _wrapCollateralGainTransfer(
    rawPopulatedTransaction: EthersPopulatedTransaction
  ): PopulatedEthersARTHTransaction<CollateralGainTransferDetails> {
    const { borrowerOperations } = _getContracts(this._readable.connection);

    return new PopulatedEthersARTHTransaction(
      rawPopulatedTransaction,
      this._readable.connection,

      ({ logs }) => {
        const [newTrove] = borrowerOperations
          .extractEvents(logs, "TroveUpdated")
          .map(({ args: { _coll, _debt } }) => new Trove(decimalify(_coll), decimalify(_debt)));

        return {
          ...this._extractStabilityPoolGainsWithdrawalDetails(logs),
          newTrove
        };
      }
    );
  }

  private async _findHintsForNominalCollateralRatio(
    nominalCollateralRatio: Decimal,
    ownAddress?: string
  ): Promise<[string, string]> {
    const { sortedTroves, hintHelpers } = _getContracts(this._readable.connection);
    const numberOfTroves = await this._readable.getNumberOfTroves();

    if (!numberOfTroves) {
      return [AddressZero, AddressZero];
    }

    if (nominalCollateralRatio.infinite) {
      return [AddressZero, await sortedTroves.getFirst()];
    }

    const totalNumberOfTrials = Math.ceil(10 * Math.sqrt(numberOfTroves));
    const [firstTrials, ...restOfTrials] = generateTrials(totalNumberOfTrials);

    const collectApproxHint = (
      {
        latestRandomSeed,
        results
      }: {
        latestRandomSeed: BigNumberish;
        results: { diff: BigNumber; hintAddress: string }[];
      },
      numberOfTrials: number
    ) =>
      hintHelpers
        .getApproxHint(nominalCollateralRatio.hex, numberOfTrials, latestRandomSeed)
        .then(({ latestRandomSeed, ...result }) => ({
          latestRandomSeed,
          results: [...results, result]
        }));

    const { results } = await restOfTrials.reduce(
      (p, numberOfTrials) => p.then(state => collectApproxHint(state, numberOfTrials)),
      collectApproxHint({ latestRandomSeed: randomInteger(), results: [] }, firstTrials)
    );

    const { hintAddress } = results.reduce((a, b) => (a.diff.lt(b.diff) ? a : b));

    let [prev, next] = await sortedTroves.findInsertPosition(
      nominalCollateralRatio.hex,
      hintAddress,
      hintAddress
    );

    if (ownAddress) {
      // In the case of reinsertion, the address of the Trove being reinserted is not a usable hint,
      // because it is deleted from the list before the reinsertion.
      // "Jump over" the Trove to get the proper hint.
      if (prev === ownAddress) {
        prev = await sortedTroves.getPrev(prev);
      } else if (next === ownAddress) {
        next = await sortedTroves.getNext(next);
      }
    }

    // Don't use `address(0)` as hint as it can result in huge gas cost.
    // (See https://github.com/liquity/dev/issues/600).
    if (prev === AddressZero) {
      prev = next;
    } else if (next === AddressZero) {
      next = prev;
    }

    return [prev, next];
  }

  private async _findHints(trove: Trove, ownAddress?: string): Promise<[string, string]> {
    if (trove instanceof TroveWithPendingRedistribution) {
      throw new Error("Rewards must be applied to this Trove");
    }

    return this._findHintsForNominalCollateralRatio(trove._nominalCollateralRatio, ownAddress);
  }

  private async _findRedemptionHints(
    amount: Decimal
  ): Promise<
    [
      truncatedAmount: Decimal,
      firstRedemptionHint: string,
      partialRedemptionUpperHint: string,
      partialRedemptionLowerHint: string,
      partialRedemptionHintNICR: BigNumber
    ]
  > {
    const { hintHelpers } = _getContracts(this._readable.connection);
    const price = await this._readable.getPrice();

    const { firstRedemptionHint, partialRedemptionHintNICR, truncatedARTHamount } =
      await hintHelpers.getRedemptionHints(amount.hex, price.hex, _redeemMaxIterations);

    const [partialRedemptionUpperHint, partialRedemptionLowerHint] =
      partialRedemptionHintNICR.isZero()
        ? [AddressZero, AddressZero]
        : await this._findHintsForNominalCollateralRatio(
            decimalify(partialRedemptionHintNICR)
            // XXX: if we knew the partially redeemed Trove's address, we'd pass it here
          );

    return [
      decimalify(truncatedARTHamount),
      firstRedemptionHint,
      partialRedemptionUpperHint,
      partialRedemptionLowerHint,
      partialRedemptionHintNICR
    ];
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.openTrove} */
  async openTrove(
    params: TroveCreationParams<Decimalish>,
    maxBorrowingRateOrOptionalParams?: Decimalish | BorrowingOperationOptionalParams,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<TroveCreationDetails>> {
    const { borrowerOperations, governance } = _getContracts(this._readable.connection);
    const normalizedParams = _normalizeTroveCreation(params);
    const { depositCollateral, borrowARTH } = normalizedParams;

    const [fees, blockTimestamp, total, price] = await Promise.all([
      this._readable._getFeesFactory(),
      this._readable._getBlockTimestamp(),
      this._readable.getTotal(),
      this._readable.getPrice()
    ]);

    const recoveryMode = total.collateralRatioIsBelowCritical(price);
    const decayBorrowingRate = async (seconds: number) =>
      await fees(blockTimestamp + seconds, recoveryMode).borrowingRate(
        governance.address,
        _getProvider(this._readable.connection)
      );

    const currentBorrowingRate = await decayBorrowingRate(0);

    const newTrove = await Trove.create(normalizedParams, currentBorrowingRate);
    const hints = await this._findHints(newTrove);

    const { maxBorrowingRate, borrowingFeeDecayToleranceMinutes } =
      normalizeBorrowingOperationOptionalParams(
        maxBorrowingRateOrOptionalParams,
        currentBorrowingRate
      );

    const txParams = (borrowARTH: Decimal): Parameters<typeof borrowerOperations.openTrove> => [
      maxBorrowingRate.hex,
      borrowARTH.hex,
      ...hints,
      AddressZero,

      { value: depositCollateral.hex, ...overrides }
    ];
    let gasHeadroom: number | undefined;

    if (overrides?.gasLimit === undefined) {
      const decayedBorrowingRate = await decayBorrowingRate(60 * borrowingFeeDecayToleranceMinutes);
      const decayedTrove = await Trove.create(normalizedParams, decayedBorrowingRate);
      const { borrowARTH: borrowARTHSimulatingDecay } = await Trove.recreate(
        decayedTrove,
        currentBorrowingRate
      );
      if (decayedTrove.debt.lt(ARTH_MINIMUM_DEBT)) {
        throw new Error(
          `Trove's debt might fall below ${ARTH_MINIMUM_DEBT} ` +
            `within ${borrowingFeeDecayToleranceMinutes} minutes`
        );
      }
      const [gasNow, gasLater] = await Promise.all([
        borrowerOperations.estimateGas.openTrove(...txParams(borrowARTH)),
        borrowerOperations.estimateGas.openTrove(...txParams(borrowARTHSimulatingDecay))
      ]);

      const gasLimit = addGasForBaseRateUpdate(borrowingFeeDecayToleranceMinutes)(
        bigNumberMax(addGasForPotentialListTraversal(gasNow), gasLater)
      );

      gasHeadroom = gasLimit.sub(gasNow).toNumber();
      overrides = { ...overrides, gasLimit };
    }

    return this._wrapTroveChangeWithFees(
      normalizedParams,
      await borrowerOperations.populateTransaction.openTrove(...txParams(borrowARTH)),
      gasHeadroom
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.closeTrove} */
  async closeTrove(
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<TroveClosureDetails>> {
    const { borrowerOperations } = _getContracts(this._readable.connection);

    return this._wrapTroveClosure(
      await borrowerOperations.estimateAndPopulate.closeTrove({ ...overrides }, id)
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.depositCollateral} */
  depositCollateral(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<TroveAdjustmentDetails>> {
    return this.adjustTrove({ depositCollateral: amount }, undefined, overrides);
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.withdrawCollateral} */
  withdrawCollateral(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<TroveAdjustmentDetails>> {
    return this.adjustTrove({ withdrawCollateral: amount }, undefined, overrides);
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.borrowARTH} */
  borrowARTH(
    amount: Decimalish,
    maxBorrowingRate?: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<TroveAdjustmentDetails>> {
    return this.adjustTrove({ borrowARTH: amount }, maxBorrowingRate, overrides);
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.repayARTH} */
  repayARTH(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<TroveAdjustmentDetails>> {
    return this.adjustTrove({ repayARTH: amount }, undefined, overrides);
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.adjustTrove} */
  async adjustTrove(
    params: TroveAdjustmentParams<Decimalish>,
    maxBorrowingRateOrOptionalParams?: Decimalish | BorrowingOperationOptionalParams,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<TroveAdjustmentDetails>> {
    const address = _requireAddress(this._readable.connection, overrides);
    const { borrowerOperations, governance } = _getContracts(this._readable.connection);

    const normalizedParams = _normalizeTroveAdjustment(params);
    const { depositCollateral, withdrawCollateral, borrowARTH, repayARTH } = normalizedParams;

    const [trove, feeVars] = await Promise.all([
      this._readable.getTrove(address),
      borrowARTH &&
        promiseAllValues({
          fees: this._readable._getFeesFactory(),
          blockTimestamp: this._readable._getBlockTimestamp(),
          total: this._readable.getTotal(),
          price: this._readable.getPrice()
        })
    ]);

    const decayBorrowingRate = async (seconds: number) =>
      await feeVars
        ?.fees(
          feeVars.blockTimestamp + seconds,
          feeVars.total.collateralRatioIsBelowCritical(feeVars.price)
        )
        .borrowingRate(governance.address, _getProvider(this._readable.connection));

    const currentBorrowingRate = await decayBorrowingRate(0);
    const adjustedTrove = await trove.adjust(normalizedParams, currentBorrowingRate);
    const hints = await this._findHints(adjustedTrove, address);

    const { maxBorrowingRate, borrowingFeeDecayToleranceMinutes } =
      normalizeBorrowingOperationOptionalParams(
        maxBorrowingRateOrOptionalParams,
        currentBorrowingRate
      );

    const txParams = (borrowARTH?: Decimal): Parameters<typeof borrowerOperations.adjustTrove> => [
      maxBorrowingRate.hex,
      (withdrawCollateral ?? Decimal.ZERO).hex,
      (borrowARTH ?? repayARTH ?? Decimal.ZERO).hex,
      !!borrowARTH,
      ...hints,
      { value: depositCollateral?.hex, ...overrides }
    ];

    let gasHeadroom: number | undefined;

    if (overrides?.gasLimit === undefined) {
      const decayedBorrowingRate = await decayBorrowingRate(60 * borrowingFeeDecayToleranceMinutes);
      const decayedTrove = await trove.adjust(normalizedParams, decayedBorrowingRate);
      const { borrowARTH: borrowARTHSimulatingDecay } = await trove.adjustTo(
        decayedTrove,
        currentBorrowingRate
      );

      if (decayedTrove.debt.lt(ARTH_MINIMUM_DEBT)) {
        throw new Error(
          `Trove's debt might fall below ${ARTH_MINIMUM_DEBT} ` +
            `within ${borrowingFeeDecayToleranceMinutes} minutes`
        );
      }

      const [gasNow, gasLater] = await Promise.all([
        borrowerOperations.estimateGas.adjustTrove(...txParams(borrowARTH)),
        borrowARTH &&
          borrowerOperations.estimateGas.adjustTrove(...txParams(borrowARTHSimulatingDecay))
      ]);

      let gasLimit = bigNumberMax(addGasForPotentialListTraversal(gasNow), gasLater);

      if (borrowARTH) {
        gasLimit = addGasForBaseRateUpdate(borrowingFeeDecayToleranceMinutes)(gasLimit);
      }

      gasHeadroom = gasLimit.sub(gasNow).toNumber();
      overrides = { ...overrides, gasLimit };
    }

    return this._wrapTroveChangeWithFees(
      normalizedParams,
      await borrowerOperations.populateTransaction.adjustTrove(...txParams(borrowARTH)),
      gasHeadroom
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.claimCollateralSurplus} */
  async claimCollateralSurplus(
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<void>> {
    const { borrowerOperations } = _getContracts(this._readable.connection);

    return this._wrapSimpleTransaction(
      await borrowerOperations.estimateAndPopulate.claimCollateral({ ...overrides }, id)
    );
  }

  /** @internal */
  async setPrice(
    price: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<void>> {
    const { priceFeed } = _getContracts(this._readable.connection);

    if (!_priceFeedIsTestnet(priceFeed)) {
      throw new Error("setPrice() unavailable on this deployment of ARTH");
    }

    return this._wrapSimpleTransaction(
      await priceFeed.estimateAndPopulate.setPrice({ ...overrides }, id, Decimal.from(price).hex)
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.liquidate} */
  async liquidate(
    address: string | string[],
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<LiquidationDetails>> {
    const { troveManager } = _getContracts(this._readable.connection);

    if (Array.isArray(address)) {
      return this._wrapLiquidation(
        await troveManager.estimateAndPopulate.batchLiquidateTroves(
          { ...overrides },
          addGasForMAHAIssuance,
          address
        )
      );
    } else {
      return this._wrapLiquidation(
        await troveManager.estimateAndPopulate.liquidate(
          { ...overrides },
          addGasForMAHAIssuance,
          address
        )
      );
    }
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.liquidateUpTo} */
  async liquidateUpTo(
    maximumNumberOfTrovesToLiquidate: number,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<LiquidationDetails>> {
    const { troveManager } = _getContracts(this._readable.connection);

    return this._wrapLiquidation(
      await troveManager.estimateAndPopulate.liquidateTroves(
        { ...overrides },
        addGasForMAHAIssuance,
        maximumNumberOfTrovesToLiquidate
      )
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.depositARTHInStabilityPool} */
  async depositARTHInStabilityPool(
    amount: Decimalish,
    frontendTag?: string,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<StabilityDepositChangeDetails>> {
    const { stabilityPool } = _getContracts(this._readable.connection);
    const depositARTH = Decimal.from(amount);

    return this._wrapStabilityDepositTopup(
      { depositARTH },
      await stabilityPool.estimateAndPopulate.provideToSP(
        { ...overrides },
        addGasForMAHAIssuance,
        depositARTH.hex,
        frontendTag ?? this._readable.connection.frontendTag ?? AddressZero
      )
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.withdrawARTHFromStabilityPool} */
  async withdrawARTHFromStabilityPool(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<StabilityDepositChangeDetails>> {
    const { stabilityPool } = _getContracts(this._readable.connection);

    return this._wrapStabilityDepositWithdrawal(
      await stabilityPool.estimateAndPopulate.withdrawFromSP(
        { ...overrides },
        addGasForMAHAIssuance,
        Decimal.from(amount).hex
      )
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.withdrawGainsFromStabilityPool} */
  async withdrawGainsFromStabilityPool(
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<StabilityPoolGainsWithdrawalDetails>> {
    const { stabilityPool } = _getContracts(this._readable.connection);

    return this._wrapStabilityPoolGainsWithdrawal(
      await stabilityPool.estimateAndPopulate.withdrawFromSP(
        { ...overrides },
        addGasForMAHAIssuance,
        Decimal.ZERO.hex
      )
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.transferCollateralGainToTrove} */
  async transferCollateralGainToTrove(
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<CollateralGainTransferDetails>> {
    const address = _requireAddress(this._readable.connection, overrides);
    const { stabilityPool } = _getContracts(this._readable.connection);

    const [initialTrove, stabilityDeposit] = await Promise.all([
      this._readable.getTrove(address),
      this._readable.getStabilityDeposit(address)
    ]);

    const finalTrove = initialTrove.addCollateral(stabilityDeposit.collateralGain);

    return this._wrapCollateralGainTransfer(
      await stabilityPool.estimateAndPopulate.withdrawETHGainToTrove(
        { ...overrides },
        compose(addGasForPotentialListTraversal, addGasForMAHAIssuance),
        ...(await this._findHints(finalTrove, address))
      )
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.sendARTH} */
  async sendARTH(
    toAddress: string,
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<void>> {
    const { arthToken } = _getContracts(this._readable.connection);

    return this._wrapSimpleTransaction(
      await arthToken.estimateAndPopulate.transfer(
        { ...overrides },
        id,
        toAddress,
        Decimal.from(amount).hex
      )
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.sendMAHA} */
  async sendMAHA(
    toAddress: string,
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<void>> {
    const { mahaToken } = _getContracts(this._readable.connection);

    return this._wrapSimpleTransaction(
      await mahaToken.estimateAndPopulate.transfer(
        { ...overrides },
        id,
        toAddress,
        Decimal.from(amount).hex
      )
    );
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.redeemARTH} */
  async redeemARTH(
    amount: Decimalish,
    maxRedemptionRate?: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersRedemption> {
    const { troveManager, governance } = _getContracts(this._readable.connection);
    const attemptedARTHAmount = Decimal.from(amount);

    const [fees, total, [truncatedAmount, firstRedemptionHint, ...partialHints]] = await Promise.all(
      [
        this._readable.getFees(),
        this._readable.getTotal(),
        this._findRedemptionHints(attemptedARTHAmount)
      ]
    );

    if (truncatedAmount.isZero) {
      throw new Error(
        `redeemARTH: amount too low to redeem (try at least ${ARTH_MINIMUM_NET_DEBT})`
      );
    }

    const defaultMaxRedemptionRate = async (amount: Decimal) =>
      Decimal.min(
        (
          await fees.redemptionRate(
            governance.address,
            _getProvider(this._readable.connection),
            amount.div(total.debt)
          )
        ).add(defaultRedemptionRateSlippageTolerance),
        Decimal.ONE
      );

    const populateRedemption = async (
      attemptedARTHAmount: Decimal,
      maxRedemptionRate?: Decimalish,
      truncatedAmount: Decimal = attemptedARTHAmount,
      partialHints: [string, string, BigNumberish] = [AddressZero, AddressZero, 0]
    ): Promise<PopulatedEthersRedemption> => {
      const maxRedemptionRateOrDefault =
        maxRedemptionRate !== undefined
          ? Decimal.from(maxRedemptionRate)
          : await defaultMaxRedemptionRate(truncatedAmount);

      return new PopulatedEthersRedemption(
        await troveManager.estimateAndPopulate.redeemCollateral(
          { ...overrides },
          addGasForBaseRateUpdate(),
          truncatedAmount.hex,
          firstRedemptionHint,
          ...partialHints,
          _redeemMaxIterations,
          maxRedemptionRateOrDefault.hex
        ),

        this._readable.connection,
        attemptedARTHAmount,
        truncatedAmount,

        truncatedAmount.lt(attemptedARTHAmount)
          ? newMaxRedemptionRate =>
              populateRedemption(
                truncatedAmount.add(ARTH_MINIMUM_NET_DEBT),
                newMaxRedemptionRate ?? maxRedemptionRate
              )
          : undefined
      );
    };

    return populateRedemption(attemptedARTHAmount, maxRedemptionRate, truncatedAmount, partialHints);
  }

  /** {@inheritDoc @mahadao/arth-base#PopulatableARTH.registerFrontend} */
  async registerFrontend(
    kickbackRate: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<PopulatedEthersARTHTransaction<void>> {
    const { stabilityPool } = _getContracts(this._readable.connection);

    return this._wrapSimpleTransaction(
      await stabilityPool.estimateAndPopulate.registerFrontEnd(
        { ...overrides },
        id,
        Decimal.from(kickbackRate).hex
      )
    );
  }
}
