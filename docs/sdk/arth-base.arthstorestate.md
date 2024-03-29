<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [ARTHStoreState](./arth-base.arthstorestate.md)

## ARTHStoreState type

Type of [ARTHStore](./arth-base.arthstore.md)<!-- -->'s [state](./arth-base.arthstore.state.md)<!-- -->.

<b>Signature:</b>

```typescript
export declare type ARTHStoreState<T = unknown> = ARTHStoreBaseState & ARTHStoreDerivedState & T;
```
<b>References:</b> [ARTHStoreBaseState](./arth-base.arthstorebasestate.md)<!-- -->, [ARTHStoreDerivedState](./arth-base.arthstorederivedstate.md)

## Remarks

It combines all properties of [ARTHStoreBaseState](./arth-base.arthstorebasestate.md) and [ARTHStoreDerivedState](./arth-base.arthstorederivedstate.md) with optional extra state added by the particular `ARTHStore` implementation.

The type parameter `T` may be used to type the extra state.

