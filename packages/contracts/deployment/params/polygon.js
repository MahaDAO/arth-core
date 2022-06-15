const externalAddrs = {
  PRICE_FEED: "0x61E9D0C12FeD7B0045A38dFf21EBB18297D2b20a",
  TIMELOCK: "0x67c569F960C1Cc0B9a7979A851f5a67018c5A3b0",
  ECOSYSTEM_FUND: "0x6bfc9DB28f0A6d11a8d9d64c86026DDD2fad293B",
  MAHA: "0xedd6ca8a4202d4a36611e2fff109648c4863ae19",
  ARTH: undefined,
  DEPLOYER: "0x67c569F960C1Cc0B9a7979A851f5a67018c5A3b0"
};

const OUTPUT_FILE = "./deployment/output/polygon.json";

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => {
  return delay(90000); // wait 90s
};

const COMMUNITY_ISSUANCE_REWARDS_DURATION = 30 * 24 * 60 * 60;
const BOOTSTRAP_PERIOD = 0;
const GAS_PRICE = 100 * 1000000000; // 50 Gwei
const TX_CONFIRMATIONS = 1;
const EXPLORER_BASE_URL = "https://polygonscan.com/address";

const NATIVE_TOKEN_SYMBOL = "MATIC";

module.exports = {
  externalAddrs,
  OUTPUT_FILE,
  waitFunction,
  GAS_PRICE,
  TX_CONFIRMATIONS,
  BOOTSTRAP_PERIOD,
  EXPLORER_BASE_URL,
  COMMUNITY_ISSUANCE_REWARDS_DURATION,
  NATIVE_TOKEN_SYMBOL
};
