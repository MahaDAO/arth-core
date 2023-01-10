<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-base](./arth-base.md) &gt; [SendableLiquity](./arth-base.sendableliquity.md) &gt; [withdrawARTHFromStabilityPool](./arth-base.sendableliquity.withdrawarthfromstabilitypool.md)

## SendableLiquity.withdrawARTHFromStabilityPool() method

Withdraw ARTH from Stability Deposit.

<b>Signature:</b>

```typescript
withdrawARTHFromStabilityPool(amount: Decimalish): Promise<SentLiquityTransaction<S, LiquityReceipt<R, StabilityDepositChangeDetails>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./arth-base.decimalish.md) | Amount of ARTH to withdraw. |

<b>Returns:</b>

Promise&lt;[SentLiquityTransaction](./arth-base.sentliquitytransaction.md)<!-- -->&lt;S, [LiquityReceipt](./arth-base.liquityreceipt.md)<!-- -->&lt;R, [StabilityDepositChangeDetails](./arth-base.stabilitydepositchangedetails.md)<!-- -->&gt;&gt;&gt;

## Remarks

As a side-effect, the transaction will also pay out the Stability Deposit's [collateral gain](./arth-base.stabilitydeposit.collateralgain.md) and [MAHA reward](./arth-base.stabilitydeposit.mahareward.md)<!-- -->.
