require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-abi-exporter");

const fs = require("fs");
const getSecret = (secretKey, defaultValue = "") => {
  const SECRETS_FILE = "./secrets.js";
  let secret = defaultValue;
  if (fs.existsSync(SECRETS_FILE)) {
    const { secrets } = require(SECRETS_FILE);
    if (secrets[secretKey]) {
      secret = secrets[secretKey];
    }
  }
  return secret;
};

const alchemyUrl = () => {
  return `https://eth-mainnet.alchemyapi.io/v2/${getSecret("alchemyAPIKey")}`;
};

module.exports = {
  paths: {
    // contracts: "./contracts",
    // artifacts: "./artifacts"
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      gas: 10000000, // tx gas limit
      blockGasLimit: 15000000,
      gasPrice: 1000000000,
      initialBaseFeePerGas: 0,
      accounts: [
        {
          balance: "1000000000000000000000000000000000000",
          privateKey: getSecret("DEPLOYER_PRIVATEKEY")
        }
      ],
      forking: {
        url: alchemyUrl()
      }
    }
  },
  etherscan: {
    apiKey: {
      bsc: getSecret("BSCSCAN_API_KEY"),
      mainnet: getSecret("ETHERSCAN_API_KEY"),
      polygon: getSecret("POLYGONSCAN_API_KEY"),
      bscTestnet: getSecret("BSCSCAN_API_KEY"),
      rinkeby: getSecret("ETHERSCAN_API_KEY"),
      polygonMumbai: getSecret("POLYGONSCAN_API_KEY")
    }
  },
  mocha: { timeout: 12000000 },
  rpc: {
    host: "localhost",
    port: 8545
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false
  },
  abiExporter: {
    path: "./deployment/output/abis/",
    runOnCompile: true,
    // only: ["TroveManager"],
    clear: true
    // spacing: 2,
    // flat: true,
    // pretty: true
  }
};
