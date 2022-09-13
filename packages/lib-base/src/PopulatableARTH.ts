import { Decimal, Decimalish } from "./Decimal";
import { TroveAdjustmentParams, TroveCreationParams } from "./Trove";
import { ARTHReceipt, SendableARTH, SentARTHTransaction } from "./SendableARTH";

import {
  CollateralGainTransferDetails,
  LiquidationDetails,
  RedemptionDetails,
  StabilityDepositChangeDetails,
  StabilityPoolGainsWithdrawalDetails,
  TroveAdjustmentDetails,
  TroveClosureDetails,
  TroveCreationDetails
} from "./TransactableARTH";

/**
 * A transaction that has been prepared for sending.
 *
 * @remarks
 * Implemented by {@link @mahadao/arth-ethers#PopulatedEthersARTHTransaction}.
 *
 * @public
 */
export interface PopulatedARTHTransaction<
  P = unknown,
  T extends SentARTHTransaction = SentARTHTransaction
> {
  /** Implementation-specific populated transaction object. */
  readonly rawPopulatedTransaction: P;

  /**
   * Send the transaction.
   *
   * @returns An object that implements {@link @mahadao/arth-base#SentARTHTransaction}.
   */
  send(): Promise<T>;
}

/**
 * A redemption transaction that has been prepared for sending.
 *
 * @remarks
 * The ARTH protocol fulfills redemptions by repaying the debt of Troves in ascending order of
 * their collateralization ratio, and taking a portion of their collateral in exchange. Due to the
 * {@link @mahadao/arth-base#ARTH_MINIMUM_DEBT | minimum debt} requirement that Troves must fulfill,
 * some ARTH amounts are not possible to redeem exactly.
 *
 * When {@link @mahadao/arth-base#PopulatableARTH.redeemARTH | redeemARTH()} is called with an
 * amount that can't be fully redeemed, the amount will be truncated (see the `redeemableARTHAmount`
 * property). When this happens, the redeemer can either redeem the truncated amount by sending the
 * transaction unchanged, or prepare a new transaction by
 * {@link @mahadao/arth-base#PopulatedRedemption.increaseAmountByMinimumNetDebt | increasing the amount}
 * to the next lowest possible value, which is the sum of the truncated amount and
 * {@link @mahadao/arth-base#ARTH_MINIMUM_NET_DEBT}.
 *
 * @public
 */
export interface PopulatedRedemption<P = unknown, S = unknown, R = unknown>
  extends PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, RedemptionDetails>>> {
  /** Amount of ARTH the redeemer is trying to redeem. */
  readonly attemptedARTHAmount: Decimal;

  /** Maximum amount of ARTH that is currently redeemable from `attemptedARTHAmount`. */
  readonly redeemableARTHAmount: Decimal;

  /** Whether `redeemableARTHAmount` is less than `attemptedARTHAmount`. */
  readonly isTruncated: boolean;

  /**
   * Prepare a new transaction by increasing the attempted amount to the next lowest redeemable
   * value.
   *
   * @param maxRedemptionRate - Maximum acceptable
   *                            {@link @mahadao/arth-base#Fees.redemptionRate | redemption rate} to
   *                            use in the new transaction.
   *
   * @remarks
   * If `maxRedemptionRate` is omitted, the original transaction's `maxRedemptionRate` is reused
   * unless that was also omitted, in which case the current redemption rate (based on the increased
   * amount) plus 0.1% is used as maximum acceptable rate.
   */
  increaseAmountByMinimumNetDebt(
    maxRedemptionRate?: Decimalish
  ): Promise<PopulatedRedemption<P, S, R>>;
}

/** @internal */
export type _PopulatableFrom<T, P> = {
  [M in keyof T]: T[M] extends (...args: infer A) => Promise<infer U>
    ? U extends SentARTHTransaction
      ? (...args: A) => Promise<PopulatedARTHTransaction<P, U>>
      : never
    : never;
};

/**
 * Prepare ARTH transactions for sending.
 *
 * @remarks
 * The functions return an object implementing {@link PopulatedARTHTransaction}, which can be
 * used to send the transaction and get a {@link SentARTHTransaction}.
 *
 * Implemented by {@link @mahadao/arth-ethers#PopulatableEthersARTH}.
 *
 * @public
 */
export interface PopulatableARTH<R = unknown, S = unknown, P = unknown>
  extends _PopulatableFrom<SendableARTH<R, S>, P> {
  // Methods re-declared for documentation purposes

  /** {@inheritDoc TransactableARTH.openTrove} */
  openTrove(
    params: TroveCreationParams<Decimalish>,
    maxBorrowingRate?: Decimalish
  ): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, TroveCreationDetails>>>
  >;

  /** {@inheritDoc TransactableARTH.closeTrove} */
  closeTrove(): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, TroveClosureDetails>>>
  >;

  /** {@inheritDoc TransactableARTH.adjustTrove} */
  adjustTrove(
    params: TroveAdjustmentParams<Decimalish>,
    maxBorrowingRate?: Decimalish
  ): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>
  >;

  /** {@inheritDoc TransactableARTH.depositCollateral} */
  depositCollateral(
    amount: Decimalish
  ): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>
  >;

  /** {@inheritDoc TransactableARTH.withdrawCollateral} */
  withdrawCollateral(
    amount: Decimalish
  ): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>
  >;

  /** {@inheritDoc TransactableARTH.borrowARTH} */
  borrowARTH(
    amount: Decimalish,
    maxBorrowingRate?: Decimalish
  ): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>
  >;

  /** {@inheritDoc TransactableARTH.repayARTH} */
  repayARTH(
    amount: Decimalish
  ): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>
  >;

  /** @internal */
  setPrice(
    price: Decimalish
  ): Promise<PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, void>>>>;

  /** {@inheritDoc TransactableARTH.liquidate} */
  liquidate(
    address: string | string[]
  ): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, LiquidationDetails>>>
  >;

  /** {@inheritDoc TransactableARTH.liquidateUpTo} */
  liquidateUpTo(
    maximumNumberOfTrovesToLiquidate: number
  ): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, LiquidationDetails>>>
  >;

  /** {@inheritDoc TransactableARTH.depositARTHInStabilityPool} */
  depositARTHInStabilityPool(
    amount: Decimalish,
    frontendTag?: string
  ): Promise<
    PopulatedARTHTransaction<
      P,
      SentARTHTransaction<S, ARTHReceipt<R, StabilityDepositChangeDetails>>
    >
  >;

  /** {@inheritDoc TransactableARTH.withdrawARTHFromStabilityPool} */
  withdrawARTHFromStabilityPool(
    amount: Decimalish
  ): Promise<
    PopulatedARTHTransaction<
      P,
      SentARTHTransaction<S, ARTHReceipt<R, StabilityDepositChangeDetails>>
    >
  >;

  /** {@inheritDoc TransactableARTH.withdrawGainsFromStabilityPool} */
  withdrawGainsFromStabilityPool(): Promise<
    PopulatedARTHTransaction<
      P,
      SentARTHTransaction<S, ARTHReceipt<R, StabilityPoolGainsWithdrawalDetails>>
    >
  >;

  /** {@inheritDoc TransactableARTH.transferCollateralGainToTrove} */
  transferCollateralGainToTrove(): Promise<
    PopulatedARTHTransaction<
      P,
      SentARTHTransaction<S, ARTHReceipt<R, CollateralGainTransferDetails>>
    >
  >;

  /** {@inheritDoc TransactableARTH.sendARTH} */
  sendARTH(
    toAddress: string,
    amount: Decimalish
  ): Promise<PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, void>>>>;

  /** {@inheritDoc TransactableARTH.sendMAHA} */
  sendMAHA(
    toAddress: string,
    amount: Decimalish
  ): Promise<PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, void>>>>;

  /** {@inheritDoc TransactableARTH.redeemARTH} */
  redeemARTH(
    amount: Decimalish,
    maxRedemptionRate?: Decimalish
  ): Promise<PopulatedRedemption<P, S, R>>;

  /** {@inheritDoc TransactableARTH.claimCollateralSurplus} */
  claimCollateralSurplus(): Promise<
    PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, void>>>
  >;

  /** {@inheritDoc TransactableARTH.registerFrontend} */
  registerFrontend(
    kickbackRate: Decimalish
  ): Promise<PopulatedARTHTransaction<P, SentARTHTransaction<S, ARTHReceipt<R, void>>>>;
}
