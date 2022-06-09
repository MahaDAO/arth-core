const externalAddrs  = {
    CHAINLINK_AGGREGATOR: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    ECOSYSTEM_FUND: "0x8EDC060089D08D2C192E2649d059c5eF6986a4C0"
}

const liquityAddrs = {
    GOVERNANCE: "0x08FBA75aE48507f4306DaF29ca3b15d6d2Ae5400",
    DEPLOYER: "0xbA1af27c0eFdfBE8B0FE1E8F890f9E896D1B2d6f",
}

const OUTPUT_FILE = "./mainnetDeployment/bscTestnet.json"

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => {
    return delay(90000) // wait 90s
}

const GAS_PRICE = 100 * 1000000000 // 6 Gwei
const TX_CONFIRMATIONS = 1

const EXPLORER_BASE_URL = "https://testnet.bscscan.com/address"

const WRAPPED_ETH = {
    NAME: "Wrapped BNB",
    SYMBOL: "WBNB"
}

module.exports = {
    externalAddrs,
    liquityAddrs,
    OUTPUT_FILE,
    waitFunction,
    GAS_PRICE,
    TX_CONFIRMATIONS,
    EXPLORER_BASE_URL,
    WRAPPED_ETH
}
