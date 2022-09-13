import { Decimalish } from "./Decimal";
import { TroveAdjustmentParams, TroveCreationParams } from "./Trove";

import {
  CollateralGainTransferDetails,
  LiquidationDetails,
  RedemptionDetails,
  StabilityDepositChangeDetails,
  StabilityPoolGainsWithdrawalDetails,
  TransactableARTH,
  TroveAdjustmentDetails,
  TroveClosureDetails,
  TroveCreationDetails
} from "./TransactableARTH";

/**
 * A transaction that has already been sent.
 *
 * @remarks
 * Implemented by {@link @mahadao/arth-ethers#SentEthersARTHTransaction}.
 *
 * @public
 */
export interface SentARTHTransaction<S = unknown, T extends ARTHReceipt = ARTHReceipt> {
  /** Implementation-specific sent transaction object. */
  readonly rawSentTransaction: S;

  /**
   * Check whether the transaction has been mined, and whether it was successful.
   *
   * @remarks
   * Unlike {@link @mahadao/arth-base#SentARTHTransaction.waitForReceipt | waitForReceipt()},
   * this function doesn't wait for the transaction to be mined.
   */
  getReceipt(): Promise<T>;

  /**
   * Wait for the transaction to be mined, and check whether it was successful.
   *
   * @returns Either a {@link @mahadao/arth-base#FailedReceipt} or a
   *          {@link @mahadao/arth-base#SuccessfulReceipt}.
   */
  waitForReceipt(): Promise<Extract<T, MinedReceipt>>;
}

/**
 * Indicates that the transaction hasn't been mined yet.
 *
 * @remarks
 * Returned by {@link SentARTHTransaction.getReceipt}.
 *
 * @public
 */
export type PendingReceipt = { status: "pending" };

/** @internal */
export const _pendingReceipt: PendingReceipt = { status: "pending" };

/**
 * Indicates that the transaction has been mined, but it failed.
 *
 * @remarks
 * The `rawReceipt` property is an implementation-specific transaction receipt object.
 *
 * Returned by {@link SentARTHTransaction.getReceipt} and
 * {@link SentARTHTransaction.waitForReceipt}.
 *
 * @public
 */
export type FailedReceipt<R = unknown> = { status: "failed"; rawReceipt: R };

/** @internal */
export const _failedReceipt = <R>(rawReceipt: R): FailedReceipt<R> => ({
  status: "failed",
  rawReceipt
});

/**
 * Indicates that the transaction has succeeded.
 *
 * @remarks
 * The `rawReceipt` property is an implementation-specific transaction receipt object.
 *
 * The `details` property may contain more information about the transaction.
 * See the return types of {@link TransactableARTH} functions for the exact contents of `details`
 * for each type of ARTH transaction.
 *
 * Returned by {@link SentARTHTransaction.getReceipt} and
 * {@link SentARTHTransaction.waitForReceipt}.
 *
 * @public
 */
export type SuccessfulReceipt<R = unknown, D = unknown> = {
  status: "succeeded";
  rawReceipt: R;
  details: D;
};

/** @internal */
export const _successfulReceipt = <R, D>(
  rawReceipt: R,
  details: D,
  toString?: () => string
): SuccessfulReceipt<R, D> => ({
  status: "succeeded",
  rawReceipt,
  details,
  ...(toString ? { toString } : {})
});

/**
 * Either a {@link FailedReceipt} or a {@link SuccessfulReceipt}.
 *
 * @public
 */
export type MinedReceipt<R = unknown, D = unknown> = FailedReceipt<R> | SuccessfulReceipt<R, D>;

/**
 * One of either a {@link PendingReceipt}, a {@link FailedReceipt} or a {@link SuccessfulReceipt}.
 *
 * @public
 */
export type ARTHReceipt<R = unknown, D = unknown> = PendingReceipt | MinedReceipt<R, D>;

/** @internal */
export type _SendableFrom<T, R, S> = {
  [M in keyof T]: T[M] extends (...args: infer A) => Promise<infer D>
    ? (...args: A) => Promise<SentARTHTransaction<S, ARTHReceipt<R, D>>>
    : never;
};

/**
 * Send ARTH transactions.
 *
 * @remarks
 * The functions return an object implementing {@link SentARTHTransaction}, which can be used
 * to monitor the transaction and get its details when it succeeds.
 *
 * Implemented by {@link @mahadao/arth-ethers#SendableEthersARTH}.
 *
 * @public
 */
export interface SendableARTH<R = unknown, S = unknown>
  extends _SendableFrom<TransactableARTH, R, S> {
  // Methods re-declared for documentation purposes

  /** {@inheritDoc TransactableARTH.openTrove} */
  openTrove(
    params: TroveCreationParams<Decimalish>,
    maxBorrowingRate?: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, TroveCreationDetails>>>;

  /** {@inheritDoc TransactableARTH.closeTrove} */
  closeTrove(): Promise<SentARTHTransaction<S, ARTHReceipt<R, TroveClosureDetails>>>;

  /** {@inheritDoc TransactableARTH.adjustTrove} */
  adjustTrove(
    params: TroveAdjustmentParams<Decimalish>,
    maxBorrowingRate?: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>;

  /** {@inheritDoc TransactableARTH.depositCollateral} */
  depositCollateral(
    amount: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>;

  /** {@inheritDoc TransactableARTH.withdrawCollateral} */
  withdrawCollateral(
    amount: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>;

  /** {@inheritDoc TransactableARTH.borrowARTH} */
  borrowARTH(
    amount: Decimalish,
    maxBorrowingRate?: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>;

  /** {@inheritDoc TransactableARTH.repayARTH} */
  repayARTH(
    amount: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>;

  /** @internal */
  setPrice(price: Decimalish): Promise<SentARTHTransaction<S, ARTHReceipt<R, void>>>;

  /** {@inheritDoc TransactableARTH.liquidate} */
  liquidate(
    address: string | string[]
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, LiquidationDetails>>>;

  /** {@inheritDoc TransactableARTH.liquidateUpTo} */
  liquidateUpTo(
    maximumNumberOfTrovesToLiquidate: number
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, LiquidationDetails>>>;

  /** {@inheritDoc TransactableARTH.depositARTHInStabilityPool} */
  depositARTHInStabilityPool(
    amount: Decimalish,
    frontendTag?: string
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, StabilityDepositChangeDetails>>>;

  /** {@inheritDoc TransactableARTH.withdrawARTHFromStabilityPool} */
  withdrawARTHFromStabilityPool(
    amount: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, StabilityDepositChangeDetails>>>;

  /** {@inheritDoc TransactableARTH.withdrawGainsFromStabilityPool} */
  withdrawGainsFromStabilityPool(): Promise<
    SentARTHTransaction<S, ARTHReceipt<R, StabilityPoolGainsWithdrawalDetails>>
  >;

  /** {@inheritDoc TransactableARTH.transferCollateralGainToTrove} */
  transferCollateralGainToTrove(): Promise<
    SentARTHTransaction<S, ARTHReceipt<R, CollateralGainTransferDetails>>
  >;

  /** {@inheritDoc TransactableARTH.sendARTH} */
  sendARTH(
    toAddress: string,
    amount: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, void>>>;

  /** {@inheritDoc TransactableARTH.sendMAHA} */
  sendMAHA(
    toAddress: string,
    amount: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, void>>>;

  /** {@inheritDoc TransactableARTH.redeemARTH} */
  redeemARTH(
    amount: Decimalish,
    maxRedemptionRate?: Decimalish
  ): Promise<SentARTHTransaction<S, ARTHReceipt<R, RedemptionDetails>>>;

  /** {@inheritDoc TransactableARTH.claimCollateralSurplus} */
  claimCollateralSurplus(): Promise<SentARTHTransaction<S, ARTHReceipt<R, void>>>;

  /** {@inheritDoc TransactableARTH.registerFrontend} */
  registerFrontend(kickbackRate: Decimalish): Promise<SentARTHTransaction<S, ARTHReceipt<R, void>>>;
}
