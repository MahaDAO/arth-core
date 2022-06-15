const externalAddrs = {
  PRICE_FEED: "0xc953285D64A3c8DF09f3167ee250605984778B53",
  TIMELOCK: "0x9a66fc7a20f21fb72d9f229984109246e9c9f4a5",
  ECOSYSTEM_FUND: "0x6bfc9DB28f0A6d11a8d9d64c86026DDD2fad293B",
  MAHA: "0xCE86F7fcD3B40791F63B86C3ea3B8B355Ce2685b",
  ARTH: "0xa5c40f510dd2edb8d8f8cbb425dacc5180458d1a",
  DEPLOYER: "0x67c569F960C1Cc0B9a7979A851f5a67018c5A3b0"
};

const OUTPUT_FILE = "./deployment/output/ethereum.json";

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => {
  return delay(90000); // wait 90s
};

const COMMUNITY_ISSUANCE_REWARDS_DURATION = 30 * 86400; // 5 days
const BOOTSTRAP_PERIOD = 7 * 86400;
const GAS_PRICE = 30 * 1000000000; // 1 Gwei
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
