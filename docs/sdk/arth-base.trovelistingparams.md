<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [TroveListingParams](./arth-base.trovelistingparams.md)

## TroveListingParams interface

Parameters of the [getTroves()](./arth-base.readableliquity.gettroves_1.md) function.

<b>Signature:</b>

```typescript
export interface TroveListingParams 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [beforeRedistribution?](./arth-base.trovelistingparams.beforeredistribution.md) | boolean | <i>(Optional)</i> When set to <code>true</code>, the retrieved Troves won't include the liquidation shares received since the last time they were directly modified. |
|  [first](./arth-base.trovelistingparams.first.md) | number | Number of Troves to retrieve. |
|  [sortedBy](./arth-base.trovelistingparams.sortedby.md) | "ascendingCollateralRatio" \| "descendingCollateralRatio" | How the Troves should be sorted. |
|  [startingAt?](./arth-base.trovelistingparams.startingat.md) | number | <i>(Optional)</i> Index of the first Trove to retrieve from the sorted list. |
