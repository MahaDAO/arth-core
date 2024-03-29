<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [LiquidationDetails](./arth-base.liquidationdetails.md)

## LiquidationDetails interface

Details of a [liquidate()](./arth-base.transactablearth.liquidate.md) or [liquidateUpTo()](./arth-base.transactablearth.liquidateupto.md) transaction.

<b>Signature:</b>

```typescript
export interface LiquidationDetails 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [arthGasCompensation](./arth-base.liquidationdetails.arthgascompensation.md) | [Decimal](./arth-base.decimal.md) | Amount of ARTH paid to the liquidator as gas compensation. |
|  [collateralGasCompensation](./arth-base.liquidationdetails.collateralgascompensation.md) | [Decimal](./arth-base.decimal.md) | Amount of native currency (e.g. Ether) paid to the liquidator as gas compensation. |
|  [liquidatedAddresses](./arth-base.liquidationdetails.liquidatedaddresses.md) | string\[\] | Addresses whose Troves were liquidated by the transaction. |
|  [totalLiquidated](./arth-base.liquidationdetails.totalliquidated.md) | [Trove](./arth-base.trove.md) | Total collateral liquidated and debt cleared by the transaction. |

