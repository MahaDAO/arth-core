<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [SendableLiquity](./arth-base.sendableliquity.md) &gt; [sendMAHA](./arth-base.sendableliquity.sendmaha.md)

## SendableLiquity.sendMAHA() method

Send MAHA tokens to an address.

<b>Signature:</b>

```typescript
sendMAHA(toAddress: string, amount: Decimalish): Promise<SentLiquityTransaction<S, LiquityReceipt<R, void>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  toAddress | string | Address of receipient. |
|  amount | [Decimalish](./arth-base.decimalish.md) | Amount of MAHA to send. |

<b>Returns:</b>

Promise&lt;[SentLiquityTransaction](./arth-base.sentliquitytransaction.md)<!-- -->&lt;S, [LiquityReceipt](./arth-base.liquityreceipt.md)<!-- -->&lt;R, void&gt;&gt;&gt;
