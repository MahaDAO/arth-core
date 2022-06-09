require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
require("hardhat-gas-reporter");
require('hardhat-abi-exporter');

const accounts = require("./hardhatAccountsList2k.js");
const accountsList = accounts.accountsList

const fs = require('fs')
const getSecret = (secretKey, defaultValue='') => {
    const SECRETS_FILE = "./secrets.js"
    let secret = defaultValue
    if (fs.existsSync(SECRETS_FILE)) {
        const { secrets } = require(SECRETS_FILE)
        if (secrets[secretKey]) { secret = secrets[secretKey] }
    }

    return secret
}
const alchemyUrl = () => {
    return `https://eth-mainnet.alchemyapi.io/v2/${getSecret('alchemyAPIKey')}`
}

const alchemyUrlRinkeby = () => {
    return `https://eth-rinkeby.alchemyapi.io/v2/${getSecret('alchemyAPIKeyRinkeby')}`
}

module.exports = {
    paths: {
        // contracts: "./contracts",
        // artifacts: "./artifacts"
    },
    solidity: {
        compilers: [
            {
                version: "0.4.23",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 100
                    }
                }
            },
            {
                version: "0.5.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 100
                    }
                }
            },
            {
                version: "0.6.11",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 100
                    }
                }
            },
        ]
    },
    networks: {
        hardhat: {
            accounts: accountsList,
            gas: 10000000,  // tx gas limit
            blockGasLimit: 15000000,
            gasPrice: 20000000000,
            initialBaseFeePerGas: 0,
        },
        mainnet: {
            url: alchemyUrl(),
            gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 20000000000,
            accounts: [
                getSecret('DEPLOYER_PRIVATEKEY', '0x60ddfe7f579ab6867cbe7a2dc03853dc141d7a4ab6dbefc0dae2d2b1bd4e487f'),
                getSecret('ACCOUNT2_PRIVATEKEY', '0x3ec7cedbafd0cb9ec05bf9f7ccfa1e8b42b3e3a02c75addfccbfeb328d1b383b')
            ]
        },
        rinkeby: {
            url: alchemyUrlRinkeby(),
            gas: 10000000,  // tx gas limit
            accounts: [getSecret('RINKEBY_DEPLOYER_PRIVATEKEY', '0x60ddfe7f579ab6867cbe7a2dc03853dc141d7a4ab6dbefc0dae2d2b1bd4e487f')]
        },
        polygon: {
            url: "https://speedy-nodes-nyc.moralis.io/a134b32bcf89c622864fd416/polygon/mainnet",
            accounts: [getSecret("POLYGON_DEPLOYER_PRIVATEKEY"), getSecret("ACCOUNT2_PRIVATEKEY")],
            gasPrice: 50 * 1000000000 // 5.1 gwei
        },
        polygonMumbai: {
            url: "https://matic-mumbai.chainstacklabs.com",
            accounts: [getSecret("POLYGON_DEPLOYER_PRIVATEKEY"), getSecret("ACCOUNT2_PRIVATEKEY")],
            gasPrice: 50 * 1000000000 // 5.1 gwei
        },
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            accounts: [getSecret("BSC_DEPLOYER_PRIVATEKEY"), getSecret("ACCOUNT2_PRIVATEKEY")]
        },
        bsc: {
            url: "https://bsc-dataseed.binance.org/",
            accounts: [getSecret("BSC_DEPLOYER_PRIVATEKEY"), getSecret("ACCOUNT2_PRIVATEKEY")]
        },
    },
    etherscan: {
        apiKey: {
            bsc: getSecret("BSCSCAN_API_KEY"),
            mainnet: getSecret("ETHERSCAN_API_KEY"),
            polygon: getSecret("POLYGONSCAN_API_KEY"),
            bscTestnet: getSecret("BSCSCAN_API_KEY"),
            rinkeby: getSecret("ETHERSCAN_API_KEY"),
            polygonMumbai: getSecret("POLYGONSCAN_API_KEY"),
        }
    },
    mocha: { timeout: 12000000 },
    rpc: {
        host: "localhost",
        port: 8545
    },
    gasReporter: {
        enabled: (process.env.REPORT_GAS) ? true : false
    },
    abiExporter: {
        path: './mainnetDeployment/jsonAbis',
        runOnCompile: true,
        clear: true,
        flat: true,
        spacing: 2,
        pretty: true,
    }
};
