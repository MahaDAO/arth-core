<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [SendableARTH](./arth-base.sendablearth.md) &gt; [withdrawCollateral](./arth-base.sendablearth.withdrawcollateral.md)

## SendableARTH.withdrawCollateral() method

Adjust existing Trove by withdrawing some of its collateral.

<b>Signature:</b>

```typescript
withdrawCollateral(amount: Decimalish): Promise<SentARTHTransaction<S, ARTHReceipt<R, TroveAdjustmentDetails>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./arth-base.decimalish.md) | The amount of collateral to withdraw from the Trove. |

<b>Returns:</b>

Promise&lt;[SentARTHTransaction](./arth-base.sentarthtransaction.md)<!-- -->&lt;S, [ARTHReceipt](./arth-base.arthreceipt.md)<!-- -->&lt;R, [TroveAdjustmentDetails](./arth-base.troveadjustmentdetails.md)<!-- -->&gt;&gt;&gt;

## Remarks

Equivalent to:

```typescript
adjustTrove({ withdrawCollateral: amount })

```
