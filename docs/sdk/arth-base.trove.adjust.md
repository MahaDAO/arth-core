<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [Trove](./arth-base.trove.md) &gt; [adjust](./arth-base.trove.adjust.md)

## Trove.adjust() method

Calculate the result of an [adjustTrove()](./arth-base.transactablearth.adjusttrove.md) transaction on this Trove.

<b>Signature:</b>

```typescript
adjust(params: TroveAdjustmentParams<Decimalish>, borrowingRate?: Decimalish): Promise<Trove>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  params | [TroveAdjustmentParams](./arth-base.troveadjustmentparams.md)<!-- -->&lt;[Decimalish](./arth-base.decimalish.md)<!-- -->&gt; | Parameters of the transaction. |
|  borrowingRate | [Decimalish](./arth-base.decimalish.md) | Borrowing rate to use when adding to the Trove's debt. |

<b>Returns:</b>

Promise&lt;[Trove](./arth-base.trove.md)<!-- -->&gt;

