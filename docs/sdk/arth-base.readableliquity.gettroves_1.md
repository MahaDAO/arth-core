<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [ReadableLiquity](./arth-base.readableliquity.md) &gt; [getTroves](./arth-base.readableliquity.gettroves_1.md)

## ReadableLiquity.getTroves() method

Get a slice from the list of Troves.

<b>Signature:</b>

```typescript
getTroves(params: TroveListingParams): Promise<UserTrove[]>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  params | [TroveListingParams](./arth-base.trovelistingparams.md) | Controls how the list is sorted, and where the slice begins and ends. |

<b>Returns:</b>

Promise&lt;[UserTrove](./arth-base.usertrove.md)<!-- -->\[\]&gt;

Pairs of owner addresses and their Troves.
