<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-ethers](./arth-ethers.md) &gt; [EthersARTH](./arth-ethers.ethersarth.md) &gt; [getTroveBeforeRedistribution](./arth-ethers.ethersarth.gettrovebeforeredistribution.md)

## EthersARTH.getTroveBeforeRedistribution() method

Get a Trove in its state after the last direct modification.

<b>Signature:</b>

```typescript
getTroveBeforeRedistribution(address?: string, overrides?: EthersCallOverrides): Promise<TroveWithPendingRedistribution>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  address | string | Address that owns the Trove. |
|  overrides | [EthersCallOverrides](./arth-ethers.etherscalloverrides.md) |  |

<b>Returns:</b>

Promise&lt;[TroveWithPendingRedistribution](./arth-base.trovewithpendingredistribution.md)<!-- -->&gt;

## Remarks

The current state of a Trove can be fetched using [getTrove()](./arth-base.readablearth.gettrove.md)<!-- -->.

