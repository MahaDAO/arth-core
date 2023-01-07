const deploymentHelper = require("../utils/deploymentHelpers.js");

contract(
  "Deployment script - Sets correct contract addresses dependencies after deployment",
  async accounts => {
    const [owner] = accounts;

    const [bountyAddress, lpRewardsAddress, multisig] = accounts.slice(997, 1000);

    let priceFeed;
    let arthToken;
    let sortedTroves;
    let troveManager;
    let activePool;
    let stabilityPool;
    let defaultPool;
    let functionCaller;
    let borrowerOperations;
    let mahaStaking;
    let mahaToken;
    let communityIssuance;
    let lockupContractFactory;

    before(async () => {
      const coreContracts = await deploymentHelper.deployLiquityCore();
      const MAHAContracts = await deploymentHelper.deployMAHAContracts(
        bountyAddress,
        lpRewardsAddress,
        multisig
      );

      priceFeed = coreContracts.priceFeedTestnet;
      arthToken = coreContracts.arthToken;
      sortedTroves = coreContracts.sortedTroves;
      troveManager = coreContracts.troveManager;
      activePool = coreContracts.activePool;
      stabilityPool = coreContracts.stabilityPool;
      defaultPool = coreContracts.defaultPool;
      functionCaller = coreContracts.functionCaller;
      borrowerOperations = coreContracts.borrowerOperations;

      mahaStaking = MAHAContracts.mahaStaking;
      mahaToken = MAHAContracts.mahaToken;
      communityIssuance = MAHAContracts.communityIssuance;
      lockupContractFactory = MAHAContracts.lockupContractFactory;

      await deploymentHelper.connectCoreContracts(coreContracts, MAHAContracts);
    });

    it("Sets the correct PriceFeed address in TroveManager", async () => {
      const priceFeedAddress = priceFeed.address;

      const recordedPriceFeedAddress = await troveManager.priceFeed();

      assert.equal(priceFeedAddress, recordedPriceFeedAddress);
    });

    it("Sets the correct ARTHValuecoin address in TroveManager", async () => {
      const arthTokenAddress = arthToken.address;

      const recordedClvTokenAddress = await troveManager.arthToken();

      assert.equal(arthTokenAddress, recordedClvTokenAddress);
    });

    it("Sets the correct SortedTroves address in TroveManager", async () => {
      const sortedTrovesAddress = sortedTroves.address;

      const recordedSortedTrovesAddress = await troveManager.sortedTroves();

      assert.equal(sortedTrovesAddress, recordedSortedTrovesAddress);
    });

    it("Sets the correct BorrowerOperations address in TroveManager", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await troveManager.borrowerOperationsAddress();

      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    // ActivePool in TroveM
    it("Sets the correct ActivePool address in TroveManager", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddresss = await troveManager.activePool();

      assert.equal(activePoolAddress, recordedActivePoolAddresss);
    });

    // DefaultPool in TroveM
    it("Sets the correct DefaultPool address in TroveManager", async () => {
      const defaultPoolAddress = defaultPool.address;

      const recordedDefaultPoolAddresss = await troveManager.defaultPool();

      assert.equal(defaultPoolAddress, recordedDefaultPoolAddresss);
    });

    // StabilityPool in TroveM
    it("Sets the correct StabilityPool address in TroveManager", async () => {
      const stabilityPoolAddress = stabilityPool.address;

      const recordedStabilityPoolAddresss = await troveManager.stabilityPool();

      assert.equal(stabilityPoolAddress, recordedStabilityPoolAddresss);
    });

    // MAHA Staking in TroveM
    it("Sets the correct MAHAStaking address in TroveManager", async () => {
      const mahaStakingAddress = mahaStaking.address;

      const recordedMAHAStakingAddress = await troveManager.mahaStaking();
      assert.equal(mahaStakingAddress, recordedMAHAStakingAddress);
    });

    // Active Pool

    it("Sets the correct StabilityPool address in ActivePool", async () => {
      const stabilityPoolAddress = stabilityPool.address;

      const recordedStabilityPoolAddress = await activePool.stabilityPoolAddress();

      assert.equal(stabilityPoolAddress, recordedStabilityPoolAddress);
    });

    it("Sets the correct DefaultPool address in ActivePool", async () => {
      const defaultPoolAddress = defaultPool.address;

      const recordedDefaultPoolAddress = await activePool.defaultPoolAddress();

      assert.equal(defaultPoolAddress, recordedDefaultPoolAddress);
    });

    it("Sets the correct BorrowerOperations address in ActivePool", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await activePool.borrowerOperationsAddress();

      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    it("Sets the correct TroveManager address in ActivePool", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await activePool.troveManagerAddress();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    // Stability Pool

    it("Sets the correct ActivePool address in StabilityPool", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddress = await stabilityPool.activePool();
      assert.equal(activePoolAddress, recordedActivePoolAddress);
    });

    it("Sets the correct BorrowerOperations address in StabilityPool", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await stabilityPool.borrowerOperations();

      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    it("Sets the correct ARTHValuecoin address in StabilityPool", async () => {
      const arthTokenAddress = arthToken.address;

      const recordedClvTokenAddress = await stabilityPool.arthToken();

      assert.equal(arthTokenAddress, recordedClvTokenAddress);
    });

    it("Sets the correct TroveManager address in StabilityPool", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await stabilityPool.troveManager();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    // Default Pool

    it("Sets the correct TroveManager address in DefaultPool", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await defaultPool.troveManagerAddress();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    it("Sets the correct ActivePool address in DefaultPool", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddress = await defaultPool.activePoolAddress();
      assert.equal(activePoolAddress, recordedActivePoolAddress);
    });

    it("Sets the correct TroveManager address in SortedTroves", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await sortedTroves.borrowerOperationsAddress();
      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    it("Sets the correct BorrowerOperations address in SortedTroves", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await sortedTroves.troveManager();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    //--- BorrowerOperations ---

    // TroveManager in BO
    it("Sets the correct TroveManager address in BorrowerOperations", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await borrowerOperations.troveManager();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    // setPriceFeed in BO
    it("Sets the correct PriceFeed address in BorrowerOperations", async () => {
      const priceFeedAddress = priceFeed.address;

      const recordedPriceFeedAddress = await borrowerOperations.priceFeed();
      assert.equal(priceFeedAddress, recordedPriceFeedAddress);
    });

    // setSortedTroves in BO
    it("Sets the correct SortedTroves address in BorrowerOperations", async () => {
      const sortedTrovesAddress = sortedTroves.address;

      const recordedSortedTrovesAddress = await borrowerOperations.sortedTroves();
      assert.equal(sortedTrovesAddress, recordedSortedTrovesAddress);
    });

    // setActivePool in BO
    it("Sets the correct ActivePool address in BorrowerOperations", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddress = await borrowerOperations.activePool();
      assert.equal(activePoolAddress, recordedActivePoolAddress);
    });

    // setDefaultPool in BO
    it("Sets the correct DefaultPool address in BorrowerOperations", async () => {
      const defaultPoolAddress = defaultPool.address;

      const recordedDefaultPoolAddress = await borrowerOperations.defaultPool();
      assert.equal(defaultPoolAddress, recordedDefaultPoolAddress);
    });

    // MAHA Staking in BO
    it("Sets the correct MAHAStaking address in BorrowerOperations", async () => {
      const mahaStakingAddress = mahaStaking.address;

      const recordedMAHAStakingAddress = await borrowerOperations.mahaStakingAddress();
      assert.equal(mahaStakingAddress, recordedMAHAStakingAddress);
    });

    // --- MAHA Staking ---

    // Sets MAHAToken in MAHAStaking
    it("Sets the correct MAHAToken address in MAHAStaking", async () => {
      const mahaTokenAddress = mahaToken.address;

      const recordedMAHATokenAddress = await mahaStaking.mahaToken();
      assert.equal(mahaTokenAddress, recordedMAHATokenAddress);
    });

    // Sets ActivePool in MAHAStaking
    it("Sets the correct ActivePool address in MAHAStaking", async () => {
      const activePoolAddress = activePool.address;

      const recordedActivePoolAddress = await mahaStaking.activePoolAddress();
      assert.equal(activePoolAddress, recordedActivePoolAddress);
    });

    // Sets ARTHValuecoin in MAHAStaking
    it("Sets the correct ActivePool address in MAHAStaking", async () => {
      const arthTokenAddress = arthToken.address;

      const recordedARTHTokenAddress = await mahaStaking.arthToken();
      assert.equal(arthTokenAddress, recordedARTHTokenAddress);
    });

    // Sets TroveManager in MAHAStaking
    it("Sets the correct ActivePool address in MAHAStaking", async () => {
      const troveManagerAddress = troveManager.address;

      const recordedTroveManagerAddress = await mahaStaking.troveManagerAddress();
      assert.equal(troveManagerAddress, recordedTroveManagerAddress);
    });

    // Sets BorrowerOperations in MAHAStaking
    it("Sets the correct BorrowerOperations address in MAHAStaking", async () => {
      const borrowerOperationsAddress = borrowerOperations.address;

      const recordedBorrowerOperationsAddress = await mahaStaking.borrowerOperationsAddress();
      assert.equal(borrowerOperationsAddress, recordedBorrowerOperationsAddress);
    });

    // ---  MAHAToken ---

    // Sets CI in MAHAToken
    it("Sets the correct CommunityIssuance address in MAHAToken", async () => {
      const communityIssuanceAddress = communityIssuance.address;

      const recordedcommunityIssuanceAddress = await mahaToken.communityIssuanceAddress();
      assert.equal(communityIssuanceAddress, recordedcommunityIssuanceAddress);
    });

    // Sets MAHAStaking in MAHAToken
    it("Sets the correct MAHAStaking address in MAHAToken", async () => {
      const mahaStakingAddress = mahaStaking.address;

      const recordedMAHAStakingAddress = await mahaToken.mahaStakingAddress();
      assert.equal(mahaStakingAddress, recordedMAHAStakingAddress);
    });

    // Sets LCF in MAHAToken
    it.skip("Sets the correct LockupContractFactory address in MAHAToken", async () => {
      const LCFAddress = lockupContractFactory.address;

      const recordedLCFAddress = await mahaToken.lockupContractFactory();
      assert.equal(LCFAddress, recordedLCFAddress);
    });

    // --- LCF  ---

    // Sets MAHAToken in LockupContractFactory
    it("Sets the correct MAHAToken address in LockupContractFactory", async () => {
      const mahaTokenAddress = mahaToken.address;

      const recordedMAHATokenAddress = await lockupContractFactory.mahaTokenAddress();
      assert.equal(mahaTokenAddress, recordedMAHATokenAddress);
    });

    // --- CI ---

    // Sets MAHAToken in CommunityIssuance
    it("Sets the correct MAHAToken address in CommunityIssuance", async () => {
      const mahaTokenAddress = mahaToken.address;

      const recordedMAHATokenAddress = await communityIssuance.mahaToken();
      assert.equal(mahaTokenAddress, recordedMAHATokenAddress);
    });

    it("Sets the correct StabilityPool address in CommunityIssuance", async () => {
      const stabilityPoolAddress = stabilityPool.address;

      const recordedStabilityPoolAddress = await communityIssuance.stabilityPoolAddress();
      assert.equal(stabilityPoolAddress, recordedStabilityPoolAddress);
    });
  }
);
