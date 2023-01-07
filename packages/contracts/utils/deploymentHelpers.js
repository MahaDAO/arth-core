const SortedTroves = artifacts.require("./SortedTroves.sol");
const TroveManager = artifacts.require("./TroveManager.sol");
const PriceFeedTestnet = artifacts.require("./PriceFeedTestnet.sol");
const ARTHValuecoin = artifacts.require("./ARTHValuecoin.sol");
const ActivePool = artifacts.require("./ActivePool.sol");
const DefaultPool = artifacts.require("./DefaultPool.sol");
const StabilityPool = artifacts.require("./StabilityPool.sol");
const GasPool = artifacts.require("./GasPool.sol");
const CollSurplusPool = artifacts.require("./CollSurplusPool.sol");
const FunctionCaller = artifacts.require("./TestContracts/FunctionCaller.sol");
const BorrowerOperations = artifacts.require("./BorrowerOperations.sol");
const Governance = artifacts.require("./Governance.sol");
const HintHelpers = artifacts.require("./HintHelpers.sol");

const MAHAToken = artifacts.require("./TestContracts/MockERC20.sol");
const CommunityIssuance = artifacts.require("./CommunityIssuance.sol");

const CommunityIssuanceTester = artifacts.require("./CommunityIssuanceTester.sol");
const StabilityPoolTester = artifacts.require("./StabilityPoolTester.sol");
const ActivePoolTester = artifacts.require("./ActivePoolTester.sol");
const DefaultPoolTester = artifacts.require("./DefaultPoolTester.sol");
const LiquityMathTester = artifacts.require("./LiquityMathTester.sol");
const BorrowerOperationsTester = artifacts.require("./BorrowerOperationsTester.sol");
const TroveManagerTester = artifacts.require("./TroveManagerTester.sol");
const ARTHTokenTester = artifacts.require("./ARTHTokenTester.sol");

// Proxy scripts
const BorrowerOperationsScript = artifacts.require("BorrowerOperationsScript");
const BorrowerWrappersScript = artifacts.require("BorrowerWrappersScript");
const TroveManagerScript = artifacts.require("TroveManagerScript");
const StabilityPoolScript = artifacts.require("StabilityPoolScript");
const TokenScript = artifacts.require("TokenScript");
const {
  buildUserProxies,
  BorrowerOperationsProxy,
  BorrowerWrappersProxy,
  TroveManagerProxy,
  StabilityPoolProxy,
  SortedTrovesProxy,
  TokenProxy
} = require("../utils/proxyHelpers.js");

/* "Liquity core" consists of all contracts in the core Liquity system.

MAHA contracts consist of only those contracts related to the MAHA Token:

-the MAHA token
-the Lockup factory and lockup contracts
-the CommunityIssuance contract
*/

const ZERO_ADDRESS = "0x" + "0".repeat(40);
const maxBytes32 = "0x" + "f".repeat(64);

class DeploymentHelper {
  static async deployLiquityCore() {
    const cmdLineArgs = process.argv;
    const frameworkPath = cmdLineArgs[1];
    // console.log(`Framework used:  ${frameworkPath}`)

    if (frameworkPath.includes("hardhat")) {
      return this.deployLiquityCoreHardhat();
    } else if (frameworkPath.includes("truffle")) {
      return this.deployLiquityCoreTruffle();
    }
  }

  static async deployMAHAContracts(stabilityPool) {
    const cmdLineArgs = process.argv;
    const frameworkPath = cmdLineArgs[1];
    // console.log(`Framework used:  ${frameworkPath}`)

    if (frameworkPath.includes("hardhat")) {
      return this.deployMAHAContractsHardhat(stabilityPool);
    } else if (frameworkPath.includes("truffle")) {
      return this.deployMAHAContractsTruffle();
    }
  }

  static async deployLiquityCoreHardhat() {
    const priceFeedTestnet = await PriceFeedTestnet.new();
    const sortedTroves = await SortedTroves.new();
    const troveManager = await TroveManager.new();
    const activePool = await ActivePool.new();
    const stabilityPool = await StabilityPool.new();
    const gasPool = await GasPool.new();
    const defaultPool = await DefaultPool.new();
    const collSurplusPool = await CollSurplusPool.new();
    const functionCaller = await FunctionCaller.new();
    const borrowerOperations = await BorrowerOperations.new();
    const governance = await Governance.new(
      "0x0000000000000000000000000000000000000001",
      troveManager.address,
      borrowerOperations.address,
      priceFeedTestnet.address,
      "0x0000000000000000000000000000000000000001",
      0
    );
    const hintHelpers = await HintHelpers.new();
    const arthToken = await ARTHValuecoin.new(governance.address);

    // await arthToken.toggleBorrowerOperations(borrowerOperations.address);
    // await arthToken.toggleTroveManager(troveManager.address);
    // await arthToken.toggleStabilityPool(stabilityPool.address);

    ARTHValuecoin.setAsDeployed(arthToken);
    DefaultPool.setAsDeployed(defaultPool);
    PriceFeedTestnet.setAsDeployed(priceFeedTestnet);
    SortedTroves.setAsDeployed(sortedTroves);
    TroveManager.setAsDeployed(troveManager);
    ActivePool.setAsDeployed(activePool);
    StabilityPool.setAsDeployed(stabilityPool);
    GasPool.setAsDeployed(gasPool);
    CollSurplusPool.setAsDeployed(collSurplusPool);
    FunctionCaller.setAsDeployed(functionCaller);
    BorrowerOperations.setAsDeployed(borrowerOperations);
    HintHelpers.setAsDeployed(hintHelpers);

    const coreContracts = {
      priceFeedTestnet,
      arthToken,
      sortedTroves,
      troveManager,
      activePool,
      stabilityPool,
      governance,
      gasPool,
      defaultPool,
      collSurplusPool,
      functionCaller,
      borrowerOperations,
      hintHelpers
    };
    return coreContracts;
  }

  static async deployTesterContractsHardhat() {
    const testerContracts = {};

    // Contract without testers (yet)
    testerContracts.priceFeedTestnet = await PriceFeedTestnet.new();
    testerContracts.sortedTroves = await SortedTroves.new();
    // Actual tester contracts
    testerContracts.communityIssuance = await CommunityIssuanceTester.new();
    testerContracts.activePool = await ActivePoolTester.new();
    testerContracts.defaultPool = await DefaultPoolTester.new();
    testerContracts.stabilityPool = await StabilityPoolTester.new();
    testerContracts.gasPool = await GasPool.new();
    testerContracts.collSurplusPool = await CollSurplusPool.new();
    testerContracts.math = await LiquityMathTester.new();
    testerContracts.borrowerOperations = await BorrowerOperationsTester.new();
    testerContracts.troveManager = await TroveManagerTester.new();
    testerContracts.functionCaller = await FunctionCaller.new();
    testerContracts.hintHelpers = await HintHelpers.new();
    testerContracts.governance = await Governance.new(
      "0x0000000000000000000000000000000000000001",
      troveManager.address,
      borrowerOperations.address,
      priceFeedTestnet.address,
      "0x0000000000000000000000000000000000000001",
      0
    );
    testerContracts.arthToken = await ARTHTokenTester.new(testerContracts.governance.address);
    return testerContracts;
  }

  static async deployMAHAContractsHardhat(stabilityPool) {
    // Deploy MAHA Token, passing Community Issuance and Factory addresses to the constructor
    const mahaToken = await MAHAToken.new("MAHA", "MAHA");
    MAHAToken.setAsDeployed(mahaToken);

    const communityIssuance = await CommunityIssuance.new(
      mahaToken.address,
      stabilityPool.address,
      86400 * 1000 * 30
    );
    CommunityIssuance.setAsDeployed(communityIssuance);

    const MAHAContracts = {
      communityIssuance,
      mahaToken
    };
    return MAHAContracts;
  }

  static async deployMAHATesterContractsHardhat(bountyAddress, lpRewardsAddress, multisigAddress) {
    const communityIssuance = await CommunityIssuanceTester.new();

    CommunityIssuanceTester.setAsDeployed(communityIssuance);

    // Deploy MAHA Token, passing Community Issuance and Factory addresses to the constructor
    const mahaToken = await MAHAToken.new("MAHA", "MAHA");
    const MAHAContracts = {
      lockupContractFactory,
      communityIssuance,
      mahaToken
    };
    return MAHAContracts;
  }

  static async deployLiquityCoreTruffle() {
    const priceFeedTestnet = await PriceFeedTestnet.new();
    const sortedTroves = await SortedTroves.new();
    const troveManager = await TroveManager.new();
    const activePool = await ActivePool.new();
    const stabilityPool = await StabilityPool.new();
    const gasPool = await GasPool.new();
    const defaultPool = await DefaultPool.new();
    const collSurplusPool = await CollSurplusPool.new();
    const functionCaller = await FunctionCaller.new();
    const borrowerOperations = await BorrowerOperations.new();
    const hintHelpers = await HintHelpers.new();
    const arthToken = await ARTHValuecoin.new(
      troveManager.address,
      stabilityPool.address,
      borrowerOperations.address
    );
    const coreContracts = {
      priceFeedTestnet,
      arthToken,
      sortedTroves,
      troveManager,
      activePool,
      stabilityPool,
      gasPool,
      defaultPool,
      collSurplusPool,
      functionCaller,
      borrowerOperations,
      hintHelpers
    };
    return coreContracts;
  }

  static async deployMAHAContractsTruffle() {
    const communityIssuance = await CommunityIssuance.new();

    /* Deploy MAHA Token, passing Community Issuance, and Factory addresses
    to the constructor  */
    const mahaToken = await MAHAToken.new("MAHA", "MAHA");

    const MAHAContracts = {
      lockupContractFactory,
      communityIssuance,
      mahaToken
    };
    return MAHAContracts;
  }

  static async deployARTHToken(contracts) {
    contracts.arthToken = await ARTHValuecoin.new(contracts.governance.address);
    return contracts;
  }

  static async deployARTHTokenTester(contracts) {
    contracts.arthToken = await ARTHTokenTester.new(contracts.governance.address);
    return contracts;
  }

  static async deployProxyScripts(contracts, MAHAContracts, owner, users) {
    const proxies = await buildUserProxies(users);

    const borrowerWrappersScript = await BorrowerWrappersScript.new(
      contracts.borrowerOperations.address,
      contracts.troveManager.address
    );
    contracts.borrowerWrappers = new BorrowerWrappersProxy(
      owner,
      proxies,
      borrowerWrappersScript.address
    );

    const borrowerOperationsScript = await BorrowerOperationsScript.new(
      contracts.borrowerOperations.address
    );
    contracts.borrowerOperations = new BorrowerOperationsProxy(
      owner,
      proxies,
      borrowerOperationsScript.address,
      contracts.borrowerOperations
    );

    const troveManagerScript = await TroveManagerScript.new(contracts.troveManager.address);
    contracts.troveManager = new TroveManagerProxy(
      owner,
      proxies,
      troveManagerScript.address,
      contracts.troveManager
    );

    const stabilityPoolScript = await StabilityPoolScript.new(contracts.stabilityPool.address);
    contracts.stabilityPool = new StabilityPoolProxy(
      owner,
      proxies,
      stabilityPoolScript.address,
      contracts.stabilityPool
    );

    contracts.sortedTroves = new SortedTrovesProxy(owner, proxies, contracts.sortedTroves);

    const arthTokenScript = await TokenScript.new(contracts.arthToken.address);
    contracts.arthToken = new TokenProxy(
      owner,
      proxies,
      arthTokenScript.address,
      contracts.arthToken
    );

    const mahaTokenScript = await TokenScript.new(MAHAContracts.mahaToken.address);
    MAHAContracts.mahaToken = new TokenProxy(
      owner,
      proxies,
      mahaTokenScript.address,
      MAHAContracts.mahaToken
    );
  }

  // Connect contracts to their dependencies
  static async connectCoreContracts(contracts, MAHAContracts) {
    // set TroveManager addr in SortedTroves
    await contracts.sortedTroves.setParams(
      maxBytes32,
      contracts.troveManager.address,
      contracts.borrowerOperations.address
    );

    // set contract addresses in the FunctionCaller
    await contracts.functionCaller.setTroveManagerAddress(contracts.troveManager.address);
    await contracts.functionCaller.setSortedTrovesAddress(contracts.sortedTroves.address);

    // set contracts in the Trove Manager
    await contracts.troveManager.setAddresses(
      contracts.borrowerOperations.address,
      contracts.activePool.address,
      contracts.defaultPool.address,
      contracts.stabilityPool.address,
      contracts.gasPool.address,
      contracts.collSurplusPool.address,
      contracts.governance.address,
      contracts.arthToken.address,
      contracts.sortedTroves.address
    );

    // set contracts in BorrowerOperations
    await contracts.borrowerOperations.setAddresses(
      contracts.troveManager.address,
      contracts.activePool.address,
      contracts.defaultPool.address,
      contracts.stabilityPool.address,
      contracts.gasPool.address,
      contracts.collSurplusPool.address,
      contracts.governance.address,
      contracts.sortedTroves.address,
      contracts.arthToken.address
    );

    // set contracts in the Pools
    await contracts.stabilityPool.setAddresses(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      contracts.activePool.address,
      contracts.arthToken.address,
      contracts.sortedTroves.address,
      contracts.governance.address,
      MAHAContracts.communityIssuance.address
    );

    await contracts.activePool.setAddresses(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      contracts.stabilityPool.address,
      contracts.defaultPool.address
    );

    await contracts.defaultPool.setAddresses(
      contracts.troveManager.address,
      contracts.activePool.address
    );

    await contracts.collSurplusPool.setAddresses(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      contracts.activePool.address
    );

    // set contracts in HintHelpers
    await contracts.hintHelpers.setAddresses(
      contracts.sortedTroves.address,
      contracts.troveManager.address,
      contracts.governance.address
    );
  }
}
module.exports = DeploymentHelper;
