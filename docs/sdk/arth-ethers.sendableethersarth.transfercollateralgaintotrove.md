<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-ethers](./arth-ethers.md) &gt; [SendableEthersARTH](./arth-ethers.sendableethersarth.md) &gt; [transferCollateralGainToTrove](./arth-ethers.sendableethersarth.transfercollateralgaintotrove.md)

## SendableEthersARTH.transferCollateralGainToTrove() method

Transfer [collateral gain](./arth-base.stabilitydeposit.collateralgain.md) from Stability Deposit to Trove.

<b>Signature:</b>

```typescript
transferCollateralGainToTrove(overrides?: EthersTransactionOverrides): Promise<SentEthersARTHTransaction<CollateralGainTransferDetails>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  overrides | [EthersTransactionOverrides](./arth-ethers.etherstransactionoverrides.md) |  |

<b>Returns:</b>

Promise&lt;[SentEthersARTHTransaction](./arth-ethers.sentethersarthtransaction.md)<!-- -->&lt;[CollateralGainTransferDetails](./arth-base.collateralgaintransferdetails.md)<!-- -->&gt;&gt;

## Remarks

The collateral gain is transfered to the Trove as additional collateral.

As a side-effect, the transaction will also pay out the Stability Deposit's [MAHA reward](./arth-base.stabilitydeposit.mahareward.md)<!-- -->.

