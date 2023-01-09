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
const HintHelpers = artifacts.require("./HintHelpers.sol");

// const MAHAStaking = artifacts.require("./MAHAStaking.sol");
const MAHAToken = artifacts.require("./MockERC20.sol");
// const LockupContractFactory = artifacts.require("./LockupContractFactory.sol");
const CommunityIssuance = artifacts.require("./CommunityIssuance.sol");

// const Unipool = artifacts.require("./Unipool.sol");

// const MAHATokenTester = artifacts.require("./MAHATokenTester.sol");
const CommunityIssuanceTester = artifacts.require("./CommunityIssuanceTester.sol");
const StabilityPoolTester = artifacts.require("./StabilityPoolTester.sol");
const ActivePoolTester = artifacts.require("./ActivePoolTester.sol");
const DefaultPoolTester = artifacts.require("./DefaultPoolTester.sol");
const LiquityMathTester = artifacts.require("./LiquityMathTester.sol");
const BorrowerOperationsTester = artifacts.require("./BorrowerOperationsTester.sol");
const TroveManagerTester = artifacts.require("./TroveManagerTester.sol");
const LUSDTokenTester = artifacts.require("./ARTHTokenTester.sol");

// Proxy scripts
const BorrowerOperationsScript = artifacts.require("BorrowerOperationsScript");
const BorrowerWrappersScript = artifacts.require("BorrowerWrappersScript");
const TroveManagerScript = artifacts.require("TroveManagerScript");
const StabilityPoolScript = artifacts.require("StabilityPoolScript");
const TokenScript = artifacts.require("TokenScript");
// const MAHAStakingScript = artifacts.require("MAHAStakingScript");
const {
  buildUserProxies,
  BorrowerOperationsProxy,
  BorrowerWrappersProxy,
  TroveManagerProxy,
  StabilityPoolProxy,
  SortedTrovesProxy,
  TokenProxy,
  // MAHAStakingProxy
} = require("../utils/proxyHelpers.js");

/* "Liquity core" consists of all contracts in the core Liquity system.

MAHA contracts consist of only those contracts related to the MAHA Token:

-the MAHA token
-the Lockup factory and lockup contracts
-the MAHAStaking contract
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

  // static async deployMAHAContracts(bountyAddress, lpRewardsAddress, multisigAddress) {
  //   const cmdLineArgs = process.argv;
  //   const frameworkPath = cmdLineArgs[1];
  //   // console.log(`Framework used:  ${frameworkPath}`)

  //   if (frameworkPath.includes("hardhat")) {
  //     return this.deployMAHAContractsHardhat(bountyAddress, lpRewardsAddress, multisigAddress);
  //   } else if (frameworkPath.includes("truffle")) {
  //     return this.deployMAHAContractsTruffle(bountyAddress, lpRewardsAddress, multisigAddress);
  //   }
  // }

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
    const hintHelpers = await HintHelpers.new();
    const lusdToken = await ARTHValuecoin.new(
      troveManager.address,
      stabilityPool.address,
      borrowerOperations.address
    );
    ARTHValuecoin.setAsDeployed(lusdToken);
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
      lusdToken,
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
    testerContracts.lusdToken = await LUSDTokenTester.new(
      testerContracts.troveManager.address,
      testerContracts.stabilityPool.address,
      testerContracts.borrowerOperations.address
    );
    return testerContracts;
  }

  // static async deployMAHAContractsHardhat(bountyAddress, lpRewardsAddress, multisigAddress) {
  //   // const lqtyStaking = await MAHAStaking.new();
  //   const lockupContractFactory = await LockupContractFactory.new();
  //   const communityIssuance = await CommunityIssuance.new();

  //   // MAHAStaking.setAsDeployed(lqtyStaking);
  //   LockupContractFactory.setAsDeployed(lockupContractFactory);
  //   CommunityIssuance.setAsDeployed(communityIssuance);

  //   // Deploy MAHA Token, passing Community Issuance and Factory addresses to the constructor
  //   const lqtyToken = await MAHAToken.new(
  //     communityIssuance.address,
  //     lqtyStaking.address,
  //     lockupContractFactory.address,
  //     bountyAddress,
  //     lpRewardsAddress,
  //     multisigAddress
  //   );
  //   MAHAToken.setAsDeployed(lqtyToken);

  //   const MAHAContracts = {
  //     lqtyStaking,
  //     lockupContractFactory,
  //     communityIssuance,
  //     lqtyToken
  //   };
  //   return MAHAContracts;
  // }

  // static async deployMAHATesterContractsHardhat(bountyAddress, lpRewardsAddress, multisigAddress) {
  //   // const lqtyStaking = await MAHAStaking.new();
  //   const lockupContractFactory = await LockupContractFactory.new();
  //   const communityIssuance = await CommunityIssuanceTester.new();

  //   // MAHAStaking.setAsDeployed(lqtyStaking);
  //   LockupContractFactory.setAsDeployed(lockupContractFactory);
  //   CommunityIssuanceTester.setAsDeployed(communityIssuance);

  //   // Deploy MAHA Token, passing Community Issuance and Factory addresses to the constructor
  //   const lqtyToken = await MAHATokenTester.new(
  //     communityIssuance.address,
  //     lqtyStaking.address,
  //     lockupContractFactory.address,
  //     bountyAddress,
  //     lpRewardsAddress,
  //     multisigAddress
  //   );
  //   MAHATokenTester.setAsDeployed(lqtyToken);

  //   const MAHAContracts = {
  //     lqtyStaking,
  //     lockupContractFactory,
  //     communityIssuance,
  //     lqtyToken
  //   };
  //   return MAHAContracts;
  // }

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
    const lusdToken = await ARTHValuecoin.new(
      troveManager.address,
      stabilityPool.address,
      borrowerOperations.address
    );
    const coreContracts = {
      priceFeedTestnet,
      lusdToken,
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

  // static async deployMAHAContractsTruffle(bountyAddress, lpRewardsAddress, multisigAddress) {
  //   const lqtyStaking = await lqtyStaking.new();
  //   const lockupContractFactory = await LockupContractFactory.new();
  //   const communityIssuance = await CommunityIssuance.new();

  //   /* Deploy MAHA Token, passing Community Issuance,  MAHAStaking, and Factory addresses
  //   to the constructor  */
  //   const lqtyToken = await MAHAToken.new(
  //     communityIssuance.address,
  //     lqtyStaking.address,
  //     lockupContractFactory.address,
  //     bountyAddress,
  //     lpRewardsAddress,
  //     multisigAddress
  //   );

  //   const MAHAContracts = {
  //     lqtyStaking,
  //     lockupContractFactory,
  //     communityIssuance,
  //     lqtyToken
  //   };
  //   return MAHAContracts;
  // }

  static async deployLUSDToken(contracts) {
    contracts.lusdToken = await ARTHValuecoin.new(
      contracts.troveManager.address,
      contracts.stabilityPool.address,
      contracts.borrowerOperations.address
    );
    return contracts;
  }

  static async deployLUSDTokenTester(contracts) {
    contracts.lusdToken = await LUSDTokenTester.new(
      contracts.troveManager.address,
      contracts.stabilityPool.address,
      contracts.borrowerOperations.address
    );
    return contracts;
  }

  static async deployProxyScripts(contracts, MAHAContracts, owner, users) {
    const proxies = await buildUserProxies(users);

    const borrowerWrappersScript = await BorrowerWrappersScript.new(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      MAHAContracts.lqtyStaking.address
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

    const lusdTokenScript = await TokenScript.new(contracts.lusdToken.address);
    contracts.lusdToken = new TokenProxy(
      owner,
      proxies,
      lusdTokenScript.address,
      contracts.lusdToken
    );

    const lqtyTokenScript = await TokenScript.new(MAHAContracts.lqtyToken.address);
    MAHAContracts.lqtyToken = new TokenProxy(
      owner,
      proxies,
      lqtyTokenScript.address,
      MAHAContracts.lqtyToken
    );

    // const lqtyStakingScript = await MAHAStakingScript.new(MAHAContracts.lqtyStaking.address);
    // MAHAContracts.lqtyStaking = new MAHAStakingProxy(
    //   owner,
    //   proxies,
    //   lqtyStakingScript.address,
    //   MAHAContracts.lqtyStaking
    // );
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
      contracts.priceFeedTestnet.address,
      contracts.lusdToken.address,
      contracts.sortedTroves.address,
      MAHAContracts.lqtyToken.address,
      MAHAContracts.lqtyStaking.address
    );

    // set contracts in BorrowerOperations
    await contracts.borrowerOperations.setAddresses(
      contracts.troveManager.address,
      contracts.activePool.address,
      contracts.defaultPool.address,
      contracts.stabilityPool.address,
      contracts.gasPool.address,
      contracts.collSurplusPool.address,
      contracts.priceFeedTestnet.address,
      contracts.sortedTroves.address,
      contracts.lusdToken.address,
      MAHAContracts.lqtyStaking.address
    );

    // set contracts in the Pools
    await contracts.stabilityPool.setAddresses(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      contracts.activePool.address,
      contracts.lusdToken.address,
      contracts.sortedTroves.address,
      contracts.priceFeedTestnet.address,
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
      contracts.troveManager.address
    );
  }

  static async connectMAHAContracts(MAHAContracts) {
    // Set MAHAToken address in LCF
    await MAHAContracts.lockupContractFactory.setMAHATokenAddress(MAHAContracts.lqtyToken.address);
  }

  static async connectMAHAContractsToCore(MAHAContracts, coreContracts) {
    await MAHAContracts.lqtyStaking.setAddresses(
      MAHAContracts.lqtyToken.address,
      coreContracts.lusdToken.address,
      coreContracts.troveManager.address,
      coreContracts.borrowerOperations.address,
      coreContracts.activePool.address
    );

    await MAHAContracts.communityIssuance.setAddresses(
      MAHAContracts.lqtyToken.address,
      coreContracts.stabilityPool.address
    );
  }

  static async connectUnipool(uniPool, MAHAContracts, uniswapPairAddr, duration) {
    await uniPool.setParams(MAHAContracts.lqtyToken.address, uniswapPairAddr, duration);
  }
}
module.exports = DeploymentHelper;
