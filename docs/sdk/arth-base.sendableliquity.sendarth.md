<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [SendableLiquity](./arth-base.sendableliquity.md) &gt; [sendARTH](./arth-base.sendableliquity.sendarth.md)

## SendableLiquity.sendARTH() method

Send ARTH tokens to an address.

<b>Signature:</b>

```typescript
sendARTH(toAddress: string, amount: Decimalish): Promise<SentLiquityTransaction<S, LiquityReceipt<R, void>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  toAddress | string | Address of receipient. |
|  amount | [Decimalish](./arth-base.decimalish.md) | Amount of ARTH to send. |

<b>Returns:</b>

Promise&lt;[SentLiquityTransaction](./arth-base.sentliquitytransaction.md)<!-- -->&lt;S, [LiquityReceipt](./arth-base.liquityreceipt.md)<!-- -->&lt;R, void&gt;&gt;&gt;
