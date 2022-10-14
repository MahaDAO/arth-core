<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [SendableLiquity](./arth-base.sendableliquity.md) &gt; [borrowARTH](./arth-base.sendableliquity.borrowarth.md)

## SendableLiquity.borrowARTH() method

Adjust existing Trove by borrowing more ARTH.

<b>Signature:</b>

```typescript
borrowARTH(amount: Decimalish, maxBorrowingRate?: Decimalish): Promise<SentLiquityTransaction<S, LiquityReceipt<R, TroveAdjustmentDetails>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./arth-base.decimalish.md) | The amount of ARTH to borrow. |
|  maxBorrowingRate | [Decimalish](./arth-base.decimalish.md) | Maximum acceptable [borrowing rate](./arth-base.fees.borrowingrate.md)<!-- -->. |

<b>Returns:</b>

Promise&lt;[SentLiquityTransaction](./arth-base.sentliquitytransaction.md)<!-- -->&lt;S, [LiquityReceipt](./arth-base.liquityreceipt.md)<!-- -->&lt;R, [TroveAdjustmentDetails](./arth-base.troveadjustmentdetails.md)<!-- -->&gt;&gt;&gt;

## Remarks

Equivalent to:

```typescript
adjustTrove({ borrowARTH: amount }, maxBorrowingRate)

```
