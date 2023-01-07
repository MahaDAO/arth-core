const externalAddrs = {
  PRICE_FEED: "0xcb056c17ce063f20a8d0650f30550b20ff1f04c1",
  TIMELOCK: "0x43c958affe41d44f0a02ae177b591e93c86adbea",
  ECOSYSTEM_FUND: "0x9032F1Bd0cc645Fde1b41941990dA85f265A7623",
  MAHA: "0x7ee5010cbd5e499b7d66a7cba2ec3bde5fca8e00",
  ARTH: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  DEPLOYER: "0xdB16C6E9f9122d506817CEeC12e4CAfa81D90281"
};

const OUTPUT_FILE = "./deployment/output/ethereum.json";

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => delay(90000); // wait 90s

const COMMUNITY_ISSUANCE_REWARDS_DURATION = 30 * 86400; // 5 days
const BOOTSTRAP_PERIOD = 7 * 86400; // 7 days
const GAS_PRICE = 20 * 1000000000; // 20 Gwei
const TX_CONFIRMATIONS = 1;
const EXPLORER_BASE_URL = "https://etherscan.io/address";

const NATIVE_TOKEN_SYMBOL = "ETH";

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
