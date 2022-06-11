const externalAddrs = {
  CHAINLINK_AGGREGATOR: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  ECOSYSTEM_FUND: "0xecce08c2636820a81fc0c805dbdc7d846636bbc4"
};

const liquityAddrs = {
  MAHA: undefined,
  ARTH: undefined,
  DEPLOYER: "0x67c569F960C1Cc0B9a7979A851f5a67018c5A3b0"
};

const OUTPUT_FILE = "./mainnetDeployment/bscTestnet.json";

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => {
  return delay(90000); // wait 90s
};

const GAS_PRICE = 5 * 1000000000; // 5 Gwei
const TX_CONFIRMATIONS = 1;

const EXPLORER_BASE_URL = "https://testnet.bscscan.com/address";

const NATIVE_TOKEN_SYMBOL = "BNB";

module.exports = {
  externalAddrs,
  liquityAddrs,
  OUTPUT_FILE,
  waitFunction,
  GAS_PRICE,
  TX_CONFIRMATIONS,
  EXPLORER_BASE_URL,
  NATIVE_TOKEN_SYMBOL
};
