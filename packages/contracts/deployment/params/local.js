const externalAddrs = {
  PRICE_FEED: undefined,
  TIMELOCK: "0xecce08c2636820a81fc0c805dbdc7d846636bbc4",
  ECOSYSTEM_FUND: "0xecce08c2636820a81fc0c805dbdc7d846636bbc4",
  MAHA: undefined,
  ARTH: undefined,
  DEPLOYER: "0xd731A01464ec12D2667EDB1d26458D9d8593354a"
};

const OUTPUT_FILE = "./deployment/output/local.json";

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => {
  return delay(90000); // wait 90s
};

const COMMUNITY_ISSUANCE_REWARDS_DURATION = 5 * 24 * 60 * 60;
const GAS_PRICE = 5 * 1000000000; // 5 Gwei
const TX_CONFIRMATIONS = 1;
const EXPLORER_BASE_URL = "https://testnet.bscscan.com/address";

const NATIVE_TOKEN_SYMBOL = "ETH";

module.exports = {
  externalAddrs,
  OUTPUT_FILE,
  waitFunction,
  GAS_PRICE,
  TX_CONFIRMATIONS,
  EXPLORER_BASE_URL,
  COMMUNITY_ISSUANCE_REWARDS_DURATION,
  NATIVE_TOKEN_SYMBOL
};
