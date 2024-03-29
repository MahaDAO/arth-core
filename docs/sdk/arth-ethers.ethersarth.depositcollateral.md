<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-ethers](./arth-ethers.md) &gt; [EthersARTH](./arth-ethers.ethersarth.md) &gt; [depositCollateral](./arth-ethers.ethersarth.depositcollateral.md)

## EthersARTH.depositCollateral() method

Adjust existing Trove by depositing more collateral.

<b>Signature:</b>

```typescript
depositCollateral(amount: Decimalish, overrides?: EthersTransactionOverrides): Promise<TroveAdjustmentDetails>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./arth-base.decimalish.md) | The amount of collateral to add to the Trove's existing collateral. |
|  overrides | [EthersTransactionOverrides](./arth-ethers.etherstransactionoverrides.md) |  |

<b>Returns:</b>

Promise&lt;[TroveAdjustmentDetails](./arth-base.troveadjustmentdetails.md)<!-- -->&gt;

## Exceptions

Throws [EthersTransactionFailedError](./arth-ethers.etherstransactionfailederror.md) in case of transaction failure. Throws [EthersTransactionCancelledError](./arth-ethers.etherstransactioncancellederror.md) if the transaction is cancelled or replaced.

## Remarks

Equivalent to:

```typescript
adjustTrove({ depositCollateral: amount })

```

