<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-ethers](./arth-ethers.md) &gt; [EthersARTH](./arth-ethers.ethersarth.md) &gt; [borrowARTH](./arth-ethers.ethersarth.borrowarth.md)

## EthersARTH.borrowARTH() method

Adjust existing Trove by borrowing more ARTH.

<b>Signature:</b>

```typescript
borrowARTH(amount: Decimalish, maxBorrowingRate?: Decimalish, overrides?: EthersTransactionOverrides): Promise<TroveAdjustmentDetails>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./arth-base.decimalish.md) | The amount of ARTH to borrow. |
|  maxBorrowingRate | [Decimalish](./arth-base.decimalish.md) | Maximum acceptable [borrowing rate](./arth-base.fees.borrowingrate.md)<!-- -->. |
|  overrides | [EthersTransactionOverrides](./arth-ethers.etherstransactionoverrides.md) |  |

<b>Returns:</b>

Promise&lt;[TroveAdjustmentDetails](./arth-base.troveadjustmentdetails.md)<!-- -->&gt;

## Exceptions

Throws [EthersTransactionFailedError](./arth-ethers.etherstransactionfailederror.md) in case of transaction failure. Throws [EthersTransactionCancelledError](./arth-ethers.etherstransactioncancellederror.md) if the transaction is cancelled or replaced.

## Remarks

Equivalent to:

```typescript
adjustTrove({ borrowARTH: amount }, maxBorrowingRate)

```

