<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-ethers](./arth-ethers.md) &gt; [EthersARTH](./arth-ethers.ethersarth.md) &gt; [registerFrontend](./arth-ethers.ethersarth.registerfrontend.md)

## EthersARTH.registerFrontend() method

<b>Signature:</b>

```typescript
registerFrontend(kickbackRate: Decimalish, overrides?: EthersTransactionOverrides): Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  kickbackRate | [Decimalish](./arth-base.decimalish.md) |  |
|  overrides | [EthersTransactionOverrides](./arth-ethers.etherstransactionoverrides.md) |  |

<b>Returns:</b>

Promise&lt;void&gt;

## Exceptions

Throws [EthersTransactionFailedError](./arth-ethers.etherstransactionfailederror.md) in case of transaction failure. Throws [EthersTransactionCancelledError](./arth-ethers.etherstransactioncancellederror.md) if the transaction is cancelled or replaced.
