<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [Trove](./arth-base.trove.md) &gt; [create](./arth-base.trove.create.md)

## Trove.create() method

Calculate the result of an [openTrove()](./arth-base.transactableliquity.opentrove.md) transaction.

<b>Signature:</b>

```typescript
static create(params: TroveCreationParams<Decimalish>, borrowingRate?: Decimalish): Trove;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  params | [TroveCreationParams](./arth-base.trovecreationparams.md)<!-- -->&lt;[Decimalish](./arth-base.decimalish.md)<!-- -->&gt; | Parameters of the transaction. |
|  borrowingRate | [Decimalish](./arth-base.decimalish.md) | Borrowing rate to use when calculating the Trove's debt. |

<b>Returns:</b>

[Trove](./arth-base.trove.md)
