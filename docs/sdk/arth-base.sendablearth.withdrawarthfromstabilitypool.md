<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [SendableARTH](./arth-base.sendablearth.md) &gt; [withdrawARTHFromStabilityPool](./arth-base.sendablearth.withdrawarthfromstabilitypool.md)

## SendableARTH.withdrawARTHFromStabilityPool() method

Withdraw ARTH from Stability Deposit.

<b>Signature:</b>

```typescript
withdrawARTHFromStabilityPool(amount: Decimalish): Promise<SentARTHTransaction<S, ARTHReceipt<R, StabilityDepositChangeDetails>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./arth-base.decimalish.md) | Amount of ARTH to withdraw. |

<b>Returns:</b>

Promise&lt;[SentARTHTransaction](./arth-base.sentarthtransaction.md)<!-- -->&lt;S, [ARTHReceipt](./arth-base.arthreceipt.md)<!-- -->&lt;R, [StabilityDepositChangeDetails](./arth-base.stabilitydepositchangedetails.md)<!-- -->&gt;&gt;&gt;

## Remarks

As a side-effect, the transaction will also pay out the Stability Deposit's [collateral gain](./arth-base.stabilitydeposit.collateralgain.md) and [MAHA reward](./arth-base.stabilitydeposit.mahareward.md)<!-- -->.

