<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [SendableARTH](./arth-base.sendablearth.md) &gt; [registerFrontend](./arth-base.sendablearth.registerfrontend.md)

## SendableARTH.registerFrontend() method

Register current wallet address as a ARTH frontend.

<b>Signature:</b>

```typescript
registerFrontend(kickbackRate: Decimalish): Promise<SentARTHTransaction<S, ARTHReceipt<R, void>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  kickbackRate | [Decimalish](./arth-base.decimalish.md) | The portion of MAHA rewards to pass onto users of the frontend (between 0 and 1). |

<b>Returns:</b>

Promise&lt;[SentARTHTransaction](./arth-base.sentarthtransaction.md)<!-- -->&lt;S, [ARTHReceipt](./arth-base.arthreceipt.md)<!-- -->&lt;R, void&gt;&gt;&gt;

