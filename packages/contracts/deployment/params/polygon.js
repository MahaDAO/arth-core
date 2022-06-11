const externalAddrs = {
  PRICE_FEED: undefined,
  TIMELOCK: "0x67c569F960C1Cc0B9a7979A851f5a67018c5A3b0",
  ECOSYSTEM_FUND: "0x4214e1b488508F2D192ec57E40aeaFbd02761782",
  MAHA: "0xedd6ca8a4202d4a36611e2fff109648c4863ae19",
  ARTH: undefined,
  DEPLOYER: "0x67c569F960C1Cc0B9a7979A851f5a67018c5A3b0"
};

const OUTPUT_FILE = "./deployment/output/local.json";

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => {
  return delay(90000); // wait 90s
};

const COMMUNITY_ISSUANCE_REWARDS_DURATION = 5 * 24 * 60 * 60;
const BOOTSTRAP_PERIOD = 0;
const GAS_PRICE = 50 * 1000000000; // 50 Gwei
const TX_CONFIRMATIONS = 1;
const EXPLORER_BASE_URL = "https://mumbai.polygonscan.com/address";

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
