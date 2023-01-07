<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [SendableARTH](./arth-base.sendablearth.md) &gt; [sendMAHA](./arth-base.sendablearth.sendmaha.md)

## SendableARTH.sendMAHA() method

Send MAHA tokens to an address.

<b>Signature:</b>

```typescript
sendMAHA(toAddress: string, amount: Decimalish): Promise<SentARTHTransaction<S, ARTHReceipt<R, void>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  toAddress | string | Address of receipient. |
|  amount | [Decimalish](./arth-base.decimalish.md) | Amount of MAHA to send. |

<b>Returns:</b>

Promise&lt;[SentARTHTransaction](./arth-base.sentarthtransaction.md)<!-- -->&lt;S, [ARTHReceipt](./arth-base.arthreceipt.md)<!-- -->&lt;R, void&gt;&gt;&gt;
