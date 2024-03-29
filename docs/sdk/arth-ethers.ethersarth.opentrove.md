<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-ethers](./arth-ethers.md) &gt; [EthersARTH](./arth-ethers.ethersarth.md) &gt; [openTrove](./arth-ethers.ethersarth.opentrove.md)

## EthersARTH.openTrove() method

Open a new Trove by depositing collateral and borrowing ARTH.

<b>Signature:</b>

```typescript
openTrove(params: TroveCreationParams<Decimalish>, maxBorrowingRateOrOptionalParams?: Decimalish | BorrowingOperationOptionalParams, overrides?: EthersTransactionOverrides): Promise<TroveCreationDetails>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  params | [TroveCreationParams](./arth-base.trovecreationparams.md)<!-- -->&lt;[Decimalish](./arth-base.decimalish.md)<!-- -->&gt; | How much to deposit and borrow. |
|  maxBorrowingRateOrOptionalParams | [Decimalish](./arth-base.decimalish.md) \| [BorrowingOperationOptionalParams](./arth-ethers.borrowingoperationoptionalparams.md) |  |
|  overrides | [EthersTransactionOverrides](./arth-ethers.etherstransactionoverrides.md) |  |

<b>Returns:</b>

Promise&lt;[TroveCreationDetails](./arth-base.trovecreationdetails.md)<!-- -->&gt;

## Exceptions

Throws [EthersTransactionFailedError](./arth-ethers.etherstransactionfailederror.md) in case of transaction failure. Throws [EthersTransactionCancelledError](./arth-ethers.etherstransactioncancellederror.md) if the transaction is cancelled or replaced.

## Remarks

If `maxBorrowingRate` is omitted, the current borrowing rate plus 0.5% is used as maximum acceptable rate.

