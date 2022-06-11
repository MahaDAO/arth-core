import { Decimal, Decimalish } from "./Decimal";

/**
 * Represents the change between two Stability Deposit states.
 *
 * @public
 */
export type StabilityDepositChange<T> =
  | { depositARTH: T; withdrawARTH?: undefined }
  | { depositARTH?: undefined; withdrawARTH: T; withdrawAllARTH: boolean };

/**
 * A Stability Deposit and its accrued gains.
 *
 * @public
 */
export class StabilityDeposit {
  /** Amount of ARTH in the Stability Deposit at the time of the last direct modification. */
  readonly initialARTH: Decimal;

  /** Amount of ARTH left in the Stability Deposit. */
  readonly currentARTH: Decimal;

  /** Amount of native currency (e.g. Ether) received in exchange for the used-up ARTH. */
  readonly collateralGain: Decimal;

  /** Amount of MAHA rewarded since the last modification of the Stability Deposit. */
  readonly mahaReward: Decimal;

  /**
   * Address of frontend through which this Stability Deposit was made.
   *
   * @remarks
   * If the Stability Deposit was made through a frontend that doesn't tag deposits, this will be
   * the zero-address.
   */
  readonly frontendTag: string;

  /** @internal */
  constructor(
    initialARTH: Decimal,
    currentARTH: Decimal,
    collateralGain: Decimal,
    mahaReward: Decimal,
    frontendTag: string
  ) {
    this.initialARTH = initialARTH;
    this.currentARTH = currentARTH;
    this.collateralGain = collateralGain;
    this.mahaReward = mahaReward;
    this.frontendTag = frontendTag;

    if (this.currentARTH.gt(this.initialARTH)) {
      throw new Error("currentARTH can't be greater than initialARTH");
    }
  }

  get isEmpty(): boolean {
    return (
      this.initialARTH.isZero &&
      this.currentARTH.isZero &&
      this.collateralGain.isZero &&
      this.mahaReward.isZero
    );
  }

  /** @internal */
  toString(): string {
    return (
      `{ initialARTH: ${this.initialARTH}` +
      `, currentARTH: ${this.currentARTH}` +
      `, collateralGain: ${this.collateralGain}` +
      `, mahaReward: ${this.mahaReward}` +
      `, frontendTag: "${this.frontendTag}" }`
    );
  }

  /**
   * Compare to another instance of `StabilityDeposit`.
   */
  equals(that: StabilityDeposit): boolean {
    return (
      this.initialARTH.eq(that.initialARTH) &&
      this.currentARTH.eq(that.currentARTH) &&
      this.collateralGain.eq(that.collateralGain) &&
      this.mahaReward.eq(that.mahaReward) &&
      this.frontendTag === that.frontendTag
    );
  }

  /**
   * Calculate the difference between the `currentARTH` in this Stability Deposit and `thatARTH`.
   *
   * @returns An object representing the change, or `undefined` if the deposited amounts are equal.
   */
  whatChanged(thatARTH: Decimalish): StabilityDepositChange<Decimal> | undefined {
    thatARTH = Decimal.from(thatARTH);

    if (thatARTH.lt(this.currentARTH)) {
      return { withdrawARTH: this.currentARTH.sub(thatARTH), withdrawAllARTH: thatARTH.isZero };
    }

    if (thatARTH.gt(this.currentARTH)) {
      return { depositARTH: thatARTH.sub(this.currentARTH) };
    }
  }

  /**
   * Apply a {@link StabilityDepositChange} to this Stability Deposit.
   *
   * @returns The new deposited ARTH amount.
   */
  apply(change: StabilityDepositChange<Decimalish> | undefined): Decimal {
    if (!change) {
      return this.currentARTH;
    }

    if (change.withdrawARTH !== undefined) {
      return change.withdrawAllARTH || this.currentARTH.lte(change.withdrawARTH)
        ? Decimal.ZERO
        : this.currentARTH.sub(change.withdrawARTH);
    } else {
      return this.currentARTH.add(change.depositARTH);
    }
  }
}
