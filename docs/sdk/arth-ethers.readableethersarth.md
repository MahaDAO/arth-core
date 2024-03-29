<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@mahadao/arth-ethers](./arth-ethers.md) &gt; [ReadableEthersARTH](./arth-ethers.readableethersarth.md)

## ReadableEthersARTH class

Ethers-based implementation of [ReadableARTH](./arth-base.readablearth.md)<!-- -->.

<b>Signature:</b>

```typescript
export declare class ReadableEthersARTH implements ReadableARTH 
```
<b>Implements:</b> [ReadableARTH](./arth-base.readablearth.md)

## Remarks

The constructor for this class is marked as internal. Third-party code should not call the constructor directly or create subclasses that extend the `ReadableEthersARTH` class.

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [connection](./arth-ethers.readableethersarth.connection.md) |  | [EthersARTHConnection](./arth-ethers.ethersarthconnection.md) |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [connect(signerOrProvider, optionalParams)](./arth-ethers.readableethersarth.connect_1.md) | <code>static</code> |  |
|  [getARTHBalance(address, overrides)](./arth-ethers.readableethersarth.getarthbalance.md) |  | Get the amount of ARTH held by an address. |
|  [getARTHInStabilityPool(overrides)](./arth-ethers.readableethersarth.getarthinstabilitypool.md) |  | Get the total amount of ARTH currently deposited in the Stability Pool. |
|  [getCollateralSurplusBalance(address, overrides)](./arth-ethers.readableethersarth.getcollateralsurplusbalance.md) |  | Get the amount of leftover collateral available for withdrawal by an address. |
|  [getFees(overrides)](./arth-ethers.readableethersarth.getfees.md) |  | Get a calculator for current fees. |
|  [getFrontendStatus(address, overrides)](./arth-ethers.readableethersarth.getfrontendstatus.md) |  | Check whether an address is registered as a ARTH frontend, and what its kickback rate is. |
|  [getMAHABalance(address, overrides)](./arth-ethers.readableethersarth.getmahabalance.md) |  |  |
|  [getNumberOfTroves(overrides)](./arth-ethers.readableethersarth.getnumberoftroves.md) |  | Get number of Troves that are currently open. |
|  [getPrice(overrides)](./arth-ethers.readableethersarth.getprice.md) |  | Get the current price of the native currency (e.g. Ether) in USD. |
|  [getRemainingStabilityPoolMAHAReward(overrides)](./arth-ethers.readableethersarth.getremainingstabilitypoolmahareward.md) |  | Get the remaining MAHA that will be collectively rewarded to stability depositors. |
|  [getStabilityDeposit(address, overrides)](./arth-ethers.readableethersarth.getstabilitydeposit.md) |  | Get the current state of a Stability Deposit. |
|  [getTotal(overrides)](./arth-ethers.readableethersarth.gettotal.md) |  | Get the total amount of collateral and debt in the ARTH system. |
|  [getTotalRedistributed(overrides)](./arth-ethers.readableethersarth.gettotalredistributed.md) |  | Get the total collateral and debt per stake that has been liquidated through redistribution. |
|  [getTrove(address, overrides)](./arth-ethers.readableethersarth.gettrove.md) |  | Get the current state of a Trove. |
|  [getTroveBeforeRedistribution(address, overrides)](./arth-ethers.readableethersarth.gettrovebeforeredistribution.md) |  | Get a Trove in its state after the last direct modification. |
|  [getTroves(params, overrides)](./arth-ethers.readableethersarth.gettroves_1.md) |  | Get a slice from the list of Troves. |
|  [hasStore()](./arth-ethers.readableethersarth.hasstore.md) |  | Check whether this <code>ReadableEthersARTH</code> is a [ReadableEthersARTHWithStore](./arth-ethers.readableethersarthwithstore.md)<!-- -->. |
|  [hasStore(store)](./arth-ethers.readableethersarth.hasstore_1.md) |  | Check whether this <code>ReadableEthersARTH</code> is a [ReadableEthersARTHWithStore](./arth-ethers.readableethersarthwithstore.md)<!-- -->&lt;[BlockPolledARTHStore](./arth-ethers.blockpolledarthstore.md)<!-- -->&gt;<!-- -->. |

