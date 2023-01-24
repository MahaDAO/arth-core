const SortedTroves = artifacts.require("./SortedTroves.sol");
const TroveManager = artifacts.require("./TroveManager.sol");
const Governance = artifacts.require("./Governance.sol");
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
const ArthTokenTester = artifacts.require("./ARTHTokenTester.sol");
const PriceFeed = artifacts.require('./PriceFeedTestnet.sol')

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
  static async deployLiquityCore(deployWallet, fundWallet) {
    const cmdLineArgs = process.argv;
    const frameworkPath = cmdLineArgs[1];
    // console.log(`Framework used:  ${frameworkPath}`)

    if (frameworkPath.includes("hardhat")) {
      return this.deployLiquityCoreHardhat(deployWallet, fundWallet);
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

  static async deployLiquityCoreHardhat(deployWallet, fundWallet) {
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
    const priceFeed = await PriceFeed.new();
    const mahaToken = await MAHAToken.new("MahaDAO", "MAHA");

    const governance = await Governance.new(
      mahaToken.address,
      deployWallet,                   // timelock address
      troveManager.address,
      borrowerOperations.address,
      priceFeed.address,
      fundWallet,
      "0"
    );

    const communityIssuance = await CommunityIssuance.new(
      governance.address,
      stabilityPool.address,
      5 * 24 * 60 * 60
    );

    const arthToken = await ARTHValuecoin.new(
      deployWallet
    );
    ARTHValuecoin.setAsDeployed(arthToken);
    DefaultPool.setAsDeployed(defaultPool);
    Governance.setAsDeployed(governance);
    SortedTroves.setAsDeployed(sortedTroves);
    TroveManager.setAsDeployed(troveManager);
    ActivePool.setAsDeployed(activePool);
    StabilityPool.setAsDeployed(stabilityPool);
    GasPool.setAsDeployed(gasPool);
    CollSurplusPool.setAsDeployed(collSurplusPool);
    FunctionCaller.setAsDeployed(functionCaller);
    BorrowerOperations.setAsDeployed(borrowerOperations);
    HintHelpers.setAsDeployed(hintHelpers);
    PriceFeed.setAsDeployed(priceFeed);
    CommunityIssuance.setAsDeployed(communityIssuance);

    const coreContracts = {
      governance,
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
      hintHelpers,
      priceFeed,
      mahaToken,
      communityIssuance
    };
    return coreContracts;
  }

  static async deployTesterContractsHardhat(deployWallet, fundWallet) {
    const testerContracts = {};

    // Contract without testers (yet)
    testerContracts.sortedTroves = await SortedTroves.new();
    // Actual tester contracts
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
    testerContracts.priceFeed = await PriceFeed.new();
    testerContracts.mahaToken = await MAHAToken.new("MAHADao", "MAHA");
    testerContracts.communityIssuance = await CommunityIssuanceTester.new(
      testerContracts.mahaToken.address,
      testerContracts.stabilityPool.address,
      5 * 24 * 60 * 60
    );
    testerContracts.governance = await Governance.new(
      testerContracts.mahaToken.address,
      deployWallet,                   // timelock address
      testerContracts.troveManager.address,
      testerContracts.borrowerOperations.address,
      testerContracts.priceFeed.address,
      fundWallet,
      "0"
    );
    testerContracts.arthToken = await ArthTokenTester.new(
      deployWallet,
      testerContracts.borrowerOperations.address,
      testerContracts.stabilityPool.address,
      testerContracts.troveManager.address,
      
    );
    return testerContracts;
  }

  static async deployMAHAContractsHardhat() {
    // Deploy MAHA Token, passing Community Issuance and Factory addresses to the constructor
    const mahaToken = await MAHAToken.new(
      "MahaDAO", "MAHA"
    );
    MAHAToken.setAsDeployed(mahaToken);

    const MAHAContracts = {
      mahaToken
    };
    return MAHAContracts;
  }

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

  static async deployLiquityCoreTruffle(deployWallet, fundWallet) {
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
    const priceFeed = await PriceFeed.new();
    const governance = await governance.new(
      deployWallet,                   // timelock address
      troveManager.address,
      borrowerOperations.address,
      priceFeed.address,
      fundWallet,
      "0"
    );
    const arthToken = await ARTHValuecoin.new(
      deployWallet
    );
    const mahaToken = await MAHAToken.new("MahaDAO", "MAHA");
    const coreContracts = {
      governance,
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
      hintHelpers,
      priceFeed,
      mahaToken
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

  static async deployARTHToken(contracts, deployWallet) {
    contracts.arthToken = await ARTHValuecoin.new(
      deployWallet
    );
    return contracts;
  }

  static async deployARTHTokenTester(contracts, deployWallet) {
    contracts.arthToken = await ArthTokenTester.new(
      deployWallet,
      contracts.borrowerOperations.address,
      contracts.stabilityPool.address,
      contracts.troveManager.address
    );
    return contracts;
  }

  // static async deployProxyScripts(contracts, MAHAContracts, owner, users) {
  //   const proxies = await buildUserProxies(users);

  //   const borrowerWrappersScript = await BorrowerWrappersScript.new(
  //     contracts.borrowerOperations.address,
  //     contracts.troveManager.address,
  //   );
  //   contracts.borrowerWrappers = new BorrowerWrappersProxy(
  //     owner,
  //     proxies,
  //     borrowerWrappersScript.address
  //   );

  //   const borrowerOperationsScript = await BorrowerOperationsScript.new(
  //     contracts.borrowerOperations.address
  //   );
  //   contracts.borrowerOperations = new BorrowerOperationsProxy(
  //     owner,
  //     proxies,
  //     borrowerOperationsScript.address,
  //     contracts.borrowerOperations
  //   );

  //   const troveManagerScript = await TroveManagerScript.new(contracts.troveManager.address);
  //   contracts.troveManager = new TroveManagerProxy(
  //     owner,
  //     proxies,
  //     troveManagerScript.address,
  //     contracts.troveManager
  //   );

  //   const stabilityPoolScript = await StabilityPoolScript.new(contracts.stabilityPool.address);
  //   contracts.stabilityPool = new StabilityPoolProxy(
  //     owner,
  //     proxies,
  //     stabilityPoolScript.address,
  //     contracts.stabilityPool
  //   );

  //   contracts.sortedTroves = new SortedTrovesProxy(owner, proxies, contracts.sortedTroves);

  //   const arthTokenScript = await TokenScript.new(contracts.arthToken.address);
  //   contracts.arthToken = new TokenProxy(
  //     owner,
  //     proxies,
  //     arthTokenScript.address,
  //     contracts.arthToken
  //   );

  //   const lqtyTokenScript = await TokenScript.new(MAHAContracts.lqtyToken.address);
  //   MAHAContracts.lqtyToken = new TokenProxy(
  //     owner,
  //     proxies,
  //     lqtyTokenScript.address,
  //     MAHAContracts.lqtyToken
  //   );

  //   // const lqtyStakingScript = await MAHAStakingScript.new(MAHAContracts.lqtyStaking.address);
  //   // MAHAContracts.lqtyStaking = new MAHAStakingProxy(
  //   //   owner,
  //   //   proxies,
  //   //   lqtyStakingScript.address,
  //   //   MAHAContracts.lqtyStaking
  //   // );
  // }

  // Connect contracts to their dependencies
  static async connectCoreContracts(contracts) {
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
      // MAHAContracts.lqtyToken.address,
      // MAHAContracts.lqtyStaking.address
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
      // MAHAContracts.lqtyStaking.address
    );

    // set contracts in the Pools
    await contracts.stabilityPool.setAddresses(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      contracts.activePool.address,
      contracts.arthToken.address,
      contracts.sortedTroves.address,
      contracts.governance.address,
      contracts.communityIssuance.address
      // MAHAContracts.communityIssuance.address
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

    await contracts.arthToken.toggleTroveManager(
      contracts.troveManager.address
    );

    await contracts.arthToken.toggleBorrowerOperations(
      contracts.borrowerOperations.address
    );

    await contracts.arthToken.toggleStabilityPool(
      contracts.stabilityPool.address
    );
  }

  // static async connectMAHAContracts(MAHAContracts) {
  //   // Set MAHAToken address in LCF
  //   await MAHAContracts.lockupContractFactory.setMAHATokenAddress(MAHAContracts.lqtyToken.address);
  // }

  // static async connectMAHAContractsToCore(MAHAContracts, coreContracts) {
  //   await MAHAContracts.lqtyStaking.setAddresses(
  //     MAHAContracts.lqtyToken.address,
  //     coreContracts.arthToken.address,
  //     coreContracts.troveManager.address,
  //     coreContracts.borrowerOperations.address,
  //     coreContracts.activePool.address
  //   );

  //   await MAHAContracts.communityIssuance.setAddresses(
  //     MAHAContracts.lqtyToken.address,
  //     coreContracts.stabilityPool.address
  //   );
  // }

  // static async connectUnipool(uniPool, MAHAContracts, uniswapPairAddr, duration) {
  //   await uniPool.setParams(MAHAContracts.lqtyToken.address, uniswapPairAddr, duration);
  // }
}
module.exports = DeploymentHelper;