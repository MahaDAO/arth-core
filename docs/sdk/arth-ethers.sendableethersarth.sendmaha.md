<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-ethers](./arth-ethers.md) &gt; [SendableEthersARTH](./arth-ethers.sendableethersarth.md) &gt; [sendMAHA](./arth-ethers.sendableethersarth.sendmaha.md)

## SendableEthersARTH.sendMAHA() method

Send MAHA tokens to an address.

<b>Signature:</b>

```typescript
sendMAHA(toAddress: string, amount: Decimalish, overrides?: EthersTransactionOverrides): Promise<SentEthersARTHTransaction<void>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  toAddress | string | Address of receipient. |
|  amount | [Decimalish](./arth-base.decimalish.md) | Amount of MAHA to send. |
|  overrides | [EthersTransactionOverrides](./arth-ethers.etherstransactionoverrides.md) |  |

<b>Returns:</b>

Promise&lt;[SentEthersARTHTransaction](./arth-ethers.sentethersarthtransaction.md)<!-- -->&lt;void&gt;&gt;

