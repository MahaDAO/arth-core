import { Decimal, Decimalish } from "./Decimal";

/**
 * Represents the change between two states of an MAHA Stake.
 *
 * @public
 */
export type MAHAStakeChange<T> =
  | { stakeMAHA: T; unstakeMAHA?: undefined }
  | { stakeMAHA?: undefined; unstakeMAHA: T; unstakeAllMAHA: boolean };

/**
 * Represents a user's MAHA stake and accrued gains.
 *
 * @remarks
 * Returned by the {@link ReadableLiquity.getMAHAStake | getMAHAStake()} function.

 * @public
 */
export class MAHAStake {
  /** The amount of MAHA that's staked. */
  readonly stakedMAHA: Decimal;

  /** Collateral gain available to withdraw. */
  readonly collateralGain: Decimal;

  /** ARTH gain available to withdraw. */
  readonly arthGain: Decimal;

  /** @internal */
  constructor(stakedMAHA = Decimal.ZERO, collateralGain = Decimal.ZERO, arthGain = Decimal.ZERO) {
    this.stakedMAHA = stakedMAHA;
    this.collateralGain = collateralGain;
    this.arthGain = arthGain;
  }

  get isEmpty(): boolean {
    return this.stakedMAHA.isZero && this.collateralGain.isZero && this.arthGain.isZero;
  }

  /** @internal */
  toString(): string {
    return (
      `{ stakedMAHA: ${this.stakedMAHA}` +
      `, collateralGain: ${this.collateralGain}` +
      `, arthGain: ${this.arthGain} }`
    );
  }

  /**
   * Compare to another instance of `MAHAStake`.
   */
  equals(that: MAHAStake): boolean {
    return (
      this.stakedMAHA.eq(that.stakedMAHA) &&
      this.collateralGain.eq(that.collateralGain) &&
      this.arthGain.eq(that.arthGain)
    );
  }

  /**
   * Calculate the difference between this `MAHAStake` and `thatStakedMAHA`.
   *
   * @returns An object representing the change, or `undefined` if the staked amounts are equal.
   */
  whatChanged(thatStakedMAHA: Decimalish): MAHAStakeChange<Decimal> | undefined {
    thatStakedMAHA = Decimal.from(thatStakedMAHA);

    if (thatStakedMAHA.lt(this.stakedMAHA)) {
      return {
        unstakeMAHA: this.stakedMAHA.sub(thatStakedMAHA),
        unstakeAllMAHA: thatStakedMAHA.isZero
      };
    }

    if (thatStakedMAHA.gt(this.stakedMAHA)) {
      return { stakeMAHA: thatStakedMAHA.sub(this.stakedMAHA) };
    }
  }

  /**
   * Apply a {@link MAHAStakeChange} to this `MAHAStake`.
   *
   * @returns The new staked MAHA amount.
   */
  apply(change: MAHAStakeChange<Decimalish> | undefined): Decimal {
    if (!change) {
      return this.stakedMAHA;
    }

    if (change.unstakeMAHA !== undefined) {
      return change.unstakeAllMAHA || this.stakedMAHA.lte(change.unstakeMAHA)
        ? Decimal.ZERO
        : this.stakedMAHA.sub(change.unstakeMAHA);
    } else {
      return this.stakedMAHA.add(change.stakeMAHA);
    }
  }
}
