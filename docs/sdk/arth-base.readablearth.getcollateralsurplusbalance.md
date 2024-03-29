<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [ReadableARTH](./arth-base.readablearth.md) &gt; [getCollateralSurplusBalance](./arth-base.readablearth.getcollateralsurplusbalance.md)

## ReadableARTH.getCollateralSurplusBalance() method

Get the amount of leftover collateral available for withdrawal by an address.

<b>Signature:</b>

```typescript
getCollateralSurplusBalance(address?: string): Promise<Decimal>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  address | string |  |

<b>Returns:</b>

Promise&lt;[Decimal](./arth-base.decimal.md)<!-- -->&gt;

## Remarks

When a Trove gets liquidated or redeemed, any collateral it has above 110% (in case of liquidation) or 100% collateralization (in case of redemption) gets sent to a pool, where it can be withdrawn from using [claimCollateralSurplus()](./arth-base.transactablearth.claimcollateralsurplus.md)<!-- -->.

