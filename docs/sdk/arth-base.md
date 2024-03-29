<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md)

## arth-base package

## Classes

|  Class | Description |
|  --- | --- |
|  [ARTHStore](./arth-base.arthstore.md) | Abstract base class of ARTH data store implementations. |
|  [BorrowingRate](./arth-base.borrowingrate.md) |  |
|  [Decimal](./arth-base.decimal.md) | Fixed-point decimal bignumber with 18 digits of precision. |
|  [Fees](./arth-base.fees.md) | Calculator for fees. |
|  [StabilityDeposit](./arth-base.stabilitydeposit.md) | A Stability Deposit and its accrued gains. |
|  [TransactionFailedError](./arth-base.transactionfailederror.md) | Thrown by [TransactableARTH](./arth-base.transactablearth.md) functions in case of transaction failure. |
|  [Trove](./arth-base.trove.md) | A combination of collateral and debt. |
|  [TroveWithPendingRedistribution](./arth-base.trovewithpendingredistribution.md) | A Trove in its state after the last direct modification. |
|  [UserTrove](./arth-base.usertrove.md) | A Trove that is associated with a single owner. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [ARTHStoreBaseState](./arth-base.arthstorebasestate.md) | State variables read from the blockchain. |
|  [ARTHStoreDerivedState](./arth-base.arthstorederivedstate.md) | State variables derived from [ARTHStoreBaseState](./arth-base.arthstorebasestate.md)<!-- -->. |
|  [ARTHStoreListenerParams](./arth-base.arthstorelistenerparams.md) | Parameters passed to [ARTHStore](./arth-base.arthstore.md) listeners. |
|  [CollateralGainTransferDetails](./arth-base.collateralgaintransferdetails.md) | Details of a [transferCollateralGainToTrove()](./arth-base.transactablearth.transfercollateralgaintotrove.md) transaction. |
|  [LiquidationDetails](./arth-base.liquidationdetails.md) | Details of a [liquidate()](./arth-base.transactablearth.liquidate.md) or [liquidateUpTo()](./arth-base.transactablearth.liquidateupto.md) transaction. |
|  [PopulatableARTH](./arth-base.populatablearth.md) | Prepare ARTH transactions for sending. |
|  [PopulatedARTHTransaction](./arth-base.populatedarthtransaction.md) | A transaction that has been prepared for sending. |
|  [PopulatedRedemption](./arth-base.populatedredemption.md) | A redemption transaction that has been prepared for sending. |
|  [ReadableARTH](./arth-base.readablearth.md) | Read the state of the ARTH protocol. |
|  [RedemptionDetails](./arth-base.redemptiondetails.md) | Details of a [redeemARTH()](./arth-base.transactablearth.redeemarth.md) transaction. |
|  [SendableARTH](./arth-base.sendablearth.md) | Send ARTH transactions. |
|  [SentARTHTransaction](./arth-base.sentarthtransaction.md) | A transaction that has already been sent. |
|  [StabilityDepositChangeDetails](./arth-base.stabilitydepositchangedetails.md) | Details of a [depositARTHInStabilityPool()](./arth-base.transactablearth.depositarthinstabilitypool.md) or [withdrawARTHFromStabilityPool()](./arth-base.transactablearth.withdrawarthfromstabilitypool.md) transaction. |
|  [StabilityPoolGainsWithdrawalDetails](./arth-base.stabilitypoolgainswithdrawaldetails.md) | Details of a [withdrawGainsFromStabilityPool()](./arth-base.transactablearth.withdrawgainsfromstabilitypool.md) transaction. |
|  [TransactableARTH](./arth-base.transactablearth.md) | Send ARTH transactions and wait for them to succeed. |
|  [TroveAdjustmentDetails](./arth-base.troveadjustmentdetails.md) | Details of an [adjustTrove()](./arth-base.transactablearth.adjusttrove.md) transaction. |
|  [TroveClosureDetails](./arth-base.troveclosuredetails.md) | Details of a [closeTrove()](./arth-base.transactablearth.closetrove.md) transaction. |
|  [TroveCreationDetails](./arth-base.trovecreationdetails.md) | Details of an [openTrove()](./arth-base.transactablearth.opentrove.md) transaction. |
|  [TroveListingParams](./arth-base.trovelistingparams.md) | Parameters of the [getTroves()](./arth-base.readablearth.gettroves_1.md) function. |

## Variables

|  Variable | Description |
|  --- | --- |
|  [ARTH\_LIQUIDATION\_RESERVE](./arth-base.arth_liquidation_reserve.md) | Amount of ARTH that's reserved for compensating the liquidator of a Trove. |
|  [ARTH\_MINIMUM\_DEBT](./arth-base.arth_minimum_debt.md) | A Trove must always have at least this much debt. |
|  [ARTH\_MINIMUM\_NET\_DEBT](./arth-base.arth_minimum_net_debt.md) | A Trove must always have at least this much debt on top of the [liquidation reserve](./arth-base.arth_liquidation_reserve.md)<!-- -->. |
|  [CRITICAL\_COLLATERAL\_RATIO](./arth-base.critical_collateral_ratio.md) | Total collateral ratio below which recovery mode is triggered. |
|  [MINIMUM\_COLLATERAL\_RATIO](./arth-base.minimum_collateral_ratio.md) | Collateral ratio below which a Trove can be liquidated in normal mode. |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [ARTHReceipt](./arth-base.arthreceipt.md) | One of either a [PendingReceipt](./arth-base.pendingreceipt.md)<!-- -->, a [FailedReceipt](./arth-base.failedreceipt.md) or a [SuccessfulReceipt](./arth-base.successfulreceipt.md)<!-- -->. |
|  [ARTHStoreState](./arth-base.arthstorestate.md) | Type of [ARTHStore](./arth-base.arthstore.md)<!-- -->'s [state](./arth-base.arthstore.state.md)<!-- -->. |
|  [Decimalish](./arth-base.decimalish.md) | Types that can be converted into a Decimal. |
|  [FailedReceipt](./arth-base.failedreceipt.md) | Indicates that the transaction has been mined, but it failed. |
|  [FrontendStatus](./arth-base.frontendstatus.md) | Represents whether an address has been registered as a ARTH frontend. |
|  [MinedReceipt](./arth-base.minedreceipt.md) | Either a [FailedReceipt](./arth-base.failedreceipt.md) or a [SuccessfulReceipt](./arth-base.successfulreceipt.md)<!-- -->. |
|  [PendingReceipt](./arth-base.pendingreceipt.md) | Indicates that the transaction hasn't been mined yet. |
|  [StabilityDepositChange](./arth-base.stabilitydepositchange.md) | Represents the change between two Stability Deposit states. |
|  [SuccessfulReceipt](./arth-base.successfulreceipt.md) | Indicates that the transaction has succeeded. |
|  [TroveAdjustmentParams](./arth-base.troveadjustmentparams.md) | Parameters of an [adjustTrove()](./arth-base.transactablearth.adjusttrove.md) transaction. |
|  [TroveChange](./arth-base.trovechange.md) | Represents the change between two Trove states. |
|  [TroveClosureParams](./arth-base.troveclosureparams.md) | Parameters of a [closeTrove()](./arth-base.transactablearth.closetrove.md) transaction. |
|  [TroveCreationError](./arth-base.trovecreationerror.md) | Describes why a Trove could not be created. |
|  [TroveCreationParams](./arth-base.trovecreationparams.md) | Parameters of an [openTrove()](./arth-base.transactablearth.opentrove.md) transaction. |
|  [UserTroveStatus](./arth-base.usertrovestatus.md) | Represents whether a UserTrove is open or not, or why it was closed. |

