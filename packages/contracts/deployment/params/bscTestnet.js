const externalAddrs = {
  PRICE_FEED: "0xAEBA459192163c73930fF167aa278317A6C05069",
  ECOSYSTEM_FUND: "0xecce08c2636820a81fc0c805dbdc7d846636bbc4",
  MAHA: "0x120da5c69E7B00618AC648Da5ea33ec60aA210ed",
  ARTH: undefined,
  DEPLOYER: "0x67c569F960C1Cc0B9a7979A851f5a67018c5A3b0"
};

const OUTPUT_FILE = "./deployment/output/bscTestnet.json";

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
  OUTPUT_FILE,
  waitFunction,
  GAS_PRICE,
  TX_CONFIRMATIONS,
  EXPLORER_BASE_URL,
  NATIVE_TOKEN_SYMBOL
};