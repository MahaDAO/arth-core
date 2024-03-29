<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [TransactableARTH](./arth-base.transactablearth.md) &gt; [transferCollateralGainToTrove](./arth-base.transactablearth.transfercollateralgaintotrove.md)

## TransactableARTH.transferCollateralGainToTrove() method

Transfer [collateral gain](./arth-base.stabilitydeposit.collateralgain.md) from Stability Deposit to Trove.

<b>Signature:</b>

```typescript
transferCollateralGainToTrove(): Promise<CollateralGainTransferDetails>;
```
<b>Returns:</b>

Promise&lt;[CollateralGainTransferDetails](./arth-base.collateralgaintransferdetails.md)<!-- -->&gt;

## Exceptions

Throws [TransactionFailedError](./arth-base.transactionfailederror.md) in case of transaction failure.

## Remarks

The collateral gain is transfered to the Trove as additional collateral.

As a side-effect, the transaction will also pay out the Stability Deposit's [MAHA reward](./arth-base.stabilitydeposit.mahareward.md)<!-- -->.

