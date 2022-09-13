# @mahadao/arth-ethers

[Ethers](https://www.npmjs.com/package/ethers)-based library for reading ARTH protocol state and sending transactions.

## Quickstart

Install in your project:

```
npm install --save @mahadao/arth-base @mahadao/arth-ethers ethers@^5.0.0
```

Connecting to an Ethereum node and sending a transaction:

```javascript
const { Wallet, providers } = require("ethers");
const { EthersARTH } = require("@mahadao/arth-ethers");

async function example() {
  const provider = new providers.JsonRpcProvider("http://localhost:8545");
  const wallet = new Wallet(process.env.PRIVATE_KEY).connect(provider);
  const liquity = await EthersARTH.connect(wallet);

  const { newTrove } = await liquity.openTrove({
    depositCollateral: 5, // ETH
    borrowLUSD: 2000
  });

  console.log(`Successfully opened a ARTH Trove (${newTrove})!`);
}
```

## More examples

See [packages/examples](https://github.com/liquity/liquity/tree/master/packages/examples) in the repo.

ARTH's [Dev UI](https://github.com/liquity/liquity/tree/master/packages/dev-frontend) itself contains many examples of `@mahadao/arth-ethers` use.

## API Reference

For now, it can be found in the public ARTH [repo](https://github.com/liquity/liquity/blob/master/docs/sdk/lib-ethers.md).
