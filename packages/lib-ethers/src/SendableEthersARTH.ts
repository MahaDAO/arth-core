import {
  CollateralGainTransferDetails,
  Decimalish,
  LiquidationDetails,
  RedemptionDetails,
  SendableARTH,
  StabilityDepositChangeDetails,
  StabilityPoolGainsWithdrawalDetails,
  TroveAdjustmentDetails,
  TroveAdjustmentParams,
  TroveClosureDetails,
  TroveCreationDetails,
  TroveCreationParams
} from "@mahadao/arth-base";

import {
  EthersTransactionOverrides,
  EthersTransactionReceipt,
  EthersTransactionResponse
} from "./types";

import {
  BorrowingOperationOptionalParams,
  PopulatableEthersARTH,
  PopulatedEthersARTHTransaction,
  SentEthersARTHTransaction
} from "./PopulatableEthersARTH";

const sendTransaction = <T>(tx: PopulatedEthersARTHTransaction<T>) => tx.send();

/**
 * Ethers-based implementation of {@link @mahadao/arth-base#SendableARTH}.
 *
 * @public
 */
export class SendableEthersARTH
  implements SendableARTH<EthersTransactionReceipt, EthersTransactionResponse>
{
  private _populate: PopulatableEthersARTH;

  constructor(populatable: PopulatableEthersARTH) {
    this._populate = populatable;
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.openTrove} */
  async openTrove(
    params: TroveCreationParams<Decimalish>,
    maxBorrowingRateOrOptionalParams?: Decimalish | BorrowingOperationOptionalParams,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<TroveCreationDetails>> {
    return this._populate
      .openTrove(params, maxBorrowingRateOrOptionalParams, overrides)
      .then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.closeTrove} */
  closeTrove(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<TroveClosureDetails>> {
    return this._populate.closeTrove(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.adjustTrove} */
  adjustTrove(
    params: TroveAdjustmentParams<Decimalish>,
    maxBorrowingRateOrOptionalParams?: Decimalish | BorrowingOperationOptionalParams,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<TroveAdjustmentDetails>> {
    return this._populate
      .adjustTrove(params, maxBorrowingRateOrOptionalParams, overrides)
      .then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.depositCollateral} */
  depositCollateral(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<TroveAdjustmentDetails>> {
    return this._populate.depositCollateral(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.withdrawCollateral} */
  withdrawCollateral(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<TroveAdjustmentDetails>> {
    return this._populate.withdrawCollateral(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.borrowARTH} */
  borrowARTH(
    amount: Decimalish,
    maxBorrowingRate?: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<TroveAdjustmentDetails>> {
    return this._populate.borrowARTH(amount, maxBorrowingRate, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.repayARTH} */
  repayARTH(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<TroveAdjustmentDetails>> {
    return this._populate.repayARTH(amount, overrides).then(sendTransaction);
  }

  /** @internal */
  setPrice(
    price: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<void>> {
    return this._populate.setPrice(price, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.liquidate} */
  liquidate(
    address: string | string[],
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<LiquidationDetails>> {
    return this._populate.liquidate(address, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.liquidateUpTo} */
  liquidateUpTo(
    maximumNumberOfTrovesToLiquidate: number,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<LiquidationDetails>> {
    return this._populate
      .liquidateUpTo(maximumNumberOfTrovesToLiquidate, overrides)
      .then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.depositARTHInStabilityPool} */
  depositARTHInStabilityPool(
    amount: Decimalish,
    frontendTag?: string,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<StabilityDepositChangeDetails>> {
    return this._populate
      .depositARTHInStabilityPool(amount, frontendTag, overrides)
      .then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.withdrawARTHFromStabilityPool} */
  withdrawARTHFromStabilityPool(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<StabilityDepositChangeDetails>> {
    return this._populate.withdrawARTHFromStabilityPool(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.withdrawGainsFromStabilityPool} */
  withdrawGainsFromStabilityPool(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<StabilityPoolGainsWithdrawalDetails>> {
    return this._populate.withdrawGainsFromStabilityPool(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.transferCollateralGainToTrove} */
  transferCollateralGainToTrove(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<CollateralGainTransferDetails>> {
    return this._populate.transferCollateralGainToTrove(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.sendARTH} */
  sendARTH(
    toAddress: string,
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<void>> {
    return this._populate.sendARTH(toAddress, amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.sendMAHA} */
  sendMAHA(
    toAddress: string,
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<void>> {
    return this._populate.sendMAHA(toAddress, amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.redeemARTH} */
  redeemARTH(
    amount: Decimalish,
    maxRedemptionRate?: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<RedemptionDetails>> {
    return this._populate.redeemARTH(amount, maxRedemptionRate, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.claimCollateralSurplus} */
  claimCollateralSurplus(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<void>> {
    return this._populate.claimCollateralSurplus(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @mahadao/arth-base#SendableARTH.registerFrontend} */
  registerFrontend(
    kickbackRate: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersARTHTransaction<void>> {
    return this._populate.registerFrontend(kickbackRate, overrides).then(sendTransaction);
  }
}
