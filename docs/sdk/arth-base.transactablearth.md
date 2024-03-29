<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [TransactableARTH](./arth-base.transactablearth.md)

## TransactableARTH interface

Send ARTH transactions and wait for them to succeed.

<b>Signature:</b>

```typescript
export interface TransactableARTH 
```

## Remarks

The functions return the details of the transaction (if any), or throw an implementation-specific subclass of [TransactionFailedError](./arth-base.transactionfailederror.md) in case of transaction failure.

Implemented by [EthersARTH](./arth-ethers.ethersarth.md)<!-- -->.

## Methods

|  Method | Description |
|  --- | --- |
|  [adjustTrove(params, maxBorrowingRate)](./arth-base.transactablearth.adjusttrove.md) | Adjust existing Trove by changing its collateral, debt, or both. |
|  [borrowARTH(amount, maxBorrowingRate)](./arth-base.transactablearth.borrowarth.md) | Adjust existing Trove by borrowing more ARTH. |
|  [claimCollateralSurplus()](./arth-base.transactablearth.claimcollateralsurplus.md) | Claim leftover collateral after a liquidation or redemption. |
|  [closeTrove()](./arth-base.transactablearth.closetrove.md) | Close existing Trove by repaying all debt and withdrawing all collateral. |
|  [depositARTHInStabilityPool(amount, frontendTag)](./arth-base.transactablearth.depositarthinstabilitypool.md) | Make a new Stability Deposit, or top up existing one. |
|  [depositCollateral(amount)](./arth-base.transactablearth.depositcollateral.md) | Adjust existing Trove by depositing more collateral. |
|  [liquidate(address)](./arth-base.transactablearth.liquidate.md) | Liquidate one or more undercollateralized Troves. |
|  [liquidateUpTo(maximumNumberOfTrovesToLiquidate)](./arth-base.transactablearth.liquidateupto.md) | Liquidate the least collateralized Troves up to a maximum number. |
|  [openTrove(params, maxBorrowingRate)](./arth-base.transactablearth.opentrove.md) | Open a new Trove by depositing collateral and borrowing ARTH. |
|  [redeemARTH(amount, maxRedemptionRate)](./arth-base.transactablearth.redeemarth.md) | Redeem ARTH to native currency (e.g. Ether) at face value. |
|  [registerFrontend(kickbackRate)](./arth-base.transactablearth.registerfrontend.md) | Register current wallet address as a ARTH frontend. |
|  [repayARTH(amount)](./arth-base.transactablearth.repayarth.md) | Adjust existing Trove by repaying some of its debt. |
|  [sendARTH(toAddress, amount)](./arth-base.transactablearth.sendarth.md) | Send ARTH tokens to an address. |
|  [sendMAHA(toAddress, amount)](./arth-base.transactablearth.sendmaha.md) | Send MAHA tokens to an address. |
|  [transferCollateralGainToTrove()](./arth-base.transactablearth.transfercollateralgaintotrove.md) | Transfer [collateral gain](./arth-base.stabilitydeposit.collateralgain.md) from Stability Deposit to Trove. |
|  [withdrawARTHFromStabilityPool(amount)](./arth-base.transactablearth.withdrawarthfromstabilitypool.md) | Withdraw ARTH from Stability Deposit. |
|  [withdrawCollateral(amount)](./arth-base.transactablearth.withdrawcollateral.md) | Adjust existing Trove by withdrawing some of its collateral. |
|  [withdrawGainsFromStabilityPool()](./arth-base.transactablearth.withdrawgainsfromstabilitypool.md) | Withdraw [collateral gain](./arth-base.stabilitydeposit.collateralgain.md) and [MAHA reward](./arth-base.stabilitydeposit.mahareward.md) from Stability Deposit. |

