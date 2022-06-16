const externalAddrs = {
  PRICE_FEED: "0xc953285D64A3c8DF09f3167ee250605984778B53",
  TIMELOCK: "0x9a66fc7a20f21fb72d9f229984109246e9c9f4a5",
  ECOSYSTEM_FUND: "0x6357EDbfE5aDA570005ceB8FAd3139eF5A8863CC",
  MAHA: "0xb4d930279552397bba2ee473229f89ec245bc365",
  ARTH: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  DEPLOYER: "0x67c569F960C1Cc0B9a7979A851f5a67018c5A3b0"
};

const OUTPUT_FILE = "./deployment/output/ethereum.json";

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => {
  return delay(90000); // wait 90s
};

const COMMUNITY_ISSUANCE_REWARDS_DURATION = 30 * 86400; // 5 days
const BOOTSTRAP_PERIOD = 7 * 86400;
const GAS_PRICE = 70 * 1000000000; // 50 Gwei
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
