<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-ethers](./arth-ethers.md) &gt; [SentEthersARTHTransaction](./arth-ethers.sentethersarthtransaction.md)

## SentEthersARTHTransaction class

A transaction that has already been sent.

<b>Signature:</b>

```typescript
export declare class SentEthersARTHTransaction<T = unknown> implements SentARTHTransaction<EthersTransactionResponse, ARTHReceipt<EthersTransactionReceipt, T>> 
```
<b>Implements:</b> SentARTHTransaction&lt;[EthersTransactionResponse](./arth-ethers.etherstransactionresponse.md)<!-- -->, ARTHReceipt&lt;[EthersTransactionReceipt](./arth-ethers.etherstransactionreceipt.md)<!-- -->, T&gt;&gt;

## Remarks

Returned by [SendableEthersARTH](./arth-ethers.sendableethersarth.md) functions.

The constructor for this class is marked as internal. Third-party code should not call the constructor directly or create subclasses that extend the `SentEthersARTHTransaction` class.

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [rawSentTransaction](./arth-ethers.sentethersarthtransaction.rawsenttransaction.md) |  | [EthersTransactionResponse](./arth-ethers.etherstransactionresponse.md) | Ethers' representation of a sent transaction. |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [getReceipt()](./arth-ethers.sentethersarthtransaction.getreceipt.md) |  |  |
|  [waitForReceipt()](./arth-ethers.sentethersarthtransaction.waitforreceipt.md) |  |  |
