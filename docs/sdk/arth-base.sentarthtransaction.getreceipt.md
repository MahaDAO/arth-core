<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [SentARTHTransaction](./arth-base.sentarthtransaction.md) &gt; [getReceipt](./arth-base.sentarthtransaction.getreceipt.md)

## SentARTHTransaction.getReceipt() method

Check whether the transaction has been mined, and whether it was successful.

<b>Signature:</b>

```typescript
getReceipt(): Promise<T>;
```
<b>Returns:</b>

Promise&lt;T&gt;

## Remarks

Unlike [waitForReceipt()](./arth-base.sentarthtransaction.waitforreceipt.md)<!-- -->, this function doesn't wait for the transaction to be mined.

