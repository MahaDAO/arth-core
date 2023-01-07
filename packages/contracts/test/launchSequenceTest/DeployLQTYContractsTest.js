const deploymentHelper = require("../../utils/deploymentHelpers.js");
const testHelpers = require("../../utils/testHelpers.js");
const CommunityIssuance = artifacts.require("./CommunityIssuance.sol");

const th = testHelpers.TestHelper;
const timeValues = testHelpers.TimeValues;
const assertRevert = th.assertRevert;
const toBN = th.toBN;
const dec = th.dec;

contract("Deploying the MAHA contracts: LCF, CI, MAHAStaking, and MAHAToken ", async accounts => {
  const [liquityAG, A, B] = accounts;
  const [bountyAddress, lpRewardsAddress, multisig] = accounts.slice(997, 1000);

  let MAHAContracts;

  const oneMillion = toBN(1000000);
  const digits = toBN(1e18);
  const thirtyTwo = toBN(32);
  const expectedCISupplyCap = thirtyTwo.mul(oneMillion).mul(digits);

  beforeEach(async () => {
    // Deploy all contracts from the first account
    MAHAContracts = await deploymentHelper.deployMAHAContracts(
      bountyAddress,
      lpRewardsAddress,
      multisig
    );
    await deploymentHelper.connectMAHAContracts(MAHAContracts);

    mahaStaking = MAHAContracts.mahaStaking;
    mahaToken = MAHAContracts.mahaToken;
    communityIssuance = MAHAContracts.communityIssuance;
    lockupContractFactory = MAHAContracts.lockupContractFactory;

    //MAHA Staking and CommunityIssuance have not yet had their setters called, so are not yet
    // connected to the rest of the system
  });

  describe("CommunityIssuance deployment", async accounts => {
    it("Stores the deployer's address", async () => {
      const storedDeployerAddress = await communityIssuance.owner();

      assert.equal(liquityAG, storedDeployerAddress);
    });
  });

  describe("MAHAStaking deployment", async accounts => {
    it("Stores the deployer's address", async () => {
      const storedDeployerAddress = await mahaStaking.owner();

      assert.equal(liquityAG, storedDeployerAddress);
    });
  });

  describe("MAHAToken deployment", async accounts => {
    it("Stores the multisig's address", async () => {
      const storedMultisigAddress = await mahaToken.multisigAddress();

      assert.equal(multisig, storedMultisigAddress);
    });

    it("Stores the CommunityIssuance address", async () => {
      const storedCIAddress = await mahaToken.communityIssuanceAddress();

      assert.equal(communityIssuance.address, storedCIAddress);
    });

    it("Stores the LockupContractFactory address", async () => {
      const storedLCFAddress = await mahaToken.lockupContractFactory();

      assert.equal(lockupContractFactory.address, storedLCFAddress);
    });

    it("Mints the correct MAHA amount to the multisig's address: (64.66 million)", async () => {
      const multisigMAHAEntitlement = await mahaToken.balanceOf(multisig);

      const twentyThreeSixes = "6".repeat(23);
      const expectedMultisigEntitlement = "64".concat(twentyThreeSixes).concat("7");
      assert.equal(multisigMAHAEntitlement, expectedMultisigEntitlement);
    });

    it("Mints the correct MAHA amount to the CommunityIssuance contract address: 32 million", async () => {
      const communityMAHAEntitlement = await mahaToken.balanceOf(communityIssuance.address);
      // 32 million as 18-digit decimal
      const _32Million = dec(32, 24);

      assert.equal(communityMAHAEntitlement, _32Million);
    });

    it("Mints the correct MAHA amount to the bountyAddress EOA: 2 million", async () => {
      const bountyAddressBal = await mahaToken.balanceOf(bountyAddress);
      // 2 million as 18-digit decimal
      const _2Million = dec(2, 24);

      assert.equal(bountyAddressBal, _2Million);
    });

    it("Mints the correct MAHA amount to the lpRewardsAddress EOA: 1.33 million", async () => {
      const lpRewardsAddressBal = await mahaToken.balanceOf(lpRewardsAddress);
      // 1.3 million as 18-digit decimal
      const _1pt33Million = "1".concat("3".repeat(24));

      assert.equal(lpRewardsAddressBal, _1pt33Million);
    });
  });

  describe("Community Issuance deployment", async accounts => {
    it("Stores the deployer's address", async () => {
      const storedDeployerAddress = await communityIssuance.owner();

      assert.equal(storedDeployerAddress, liquityAG);
    });

    it("Has a supply cap of 32 million", async () => {
      const supplyCap = await communityIssuance.MAHASupplyCap();

      assert.isTrue(expectedCISupplyCap.eq(supplyCap));
    });

    it("Liquity AG can set addresses if CI's MAHA balance is equal or greater than 32 million ", async () => {
      const MAHABalance = await mahaToken.balanceOf(communityIssuance.address);
      assert.isTrue(MAHABalance.eq(expectedCISupplyCap));

      // Deploy core contracts, just to get the Stability Pool address
      const coreContracts = await deploymentHelper.deployLiquityCore();

      const tx = await communityIssuance.setAddresses(
        mahaToken.address,
        coreContracts.stabilityPool.address,
        { from: liquityAG }
      );
      assert.isTrue(tx.receipt.status);
    });

    it("Liquity AG can't set addresses if CI's MAHA balance is < 32 million ", async () => {
      const newCI = await CommunityIssuance.new();

      const MAHABalance = await mahaToken.balanceOf(newCI.address);
      assert.equal(MAHABalance, "0");

      // Deploy core contracts, just to get the Stability Pool address
      const coreContracts = await deploymentHelper.deployLiquityCore();

      await th.fastForwardTime(timeValues.SECONDS_IN_ONE_YEAR, web3.currentProvider);
      await mahaToken.transfer(newCI.address, "31999999999999999999999999", { from: multisig }); // 1e-18 less than CI expects (32 million)

      try {
        const tx = await newCI.setAddresses(mahaToken.address, coreContracts.stabilityPool.address, {
          from: liquityAG
        });

        // Check it gives the expected error message for a failed Solidity 'assert'
      } catch (err) {
        assert.include(err.message, "invalid opcode");
      }
    });
  });

  describe("Connecting MAHAToken to LCF, CI and MAHAStaking", async accounts => {
    it("sets the correct MAHAToken address in MAHAStaking", async () => {
      // Deploy core contracts and set the MAHAToken address in the CI and MAHAStaking
      const coreContracts = await deploymentHelper.deployLiquityCore();
      await deploymentHelper.connectMAHAContractsToCore(MAHAContracts, coreContracts);

      const mahaTokenAddress = mahaToken.address;

      const recordedMAHATokenAddress = await mahaStaking.mahaToken();
      assert.equal(mahaTokenAddress, recordedMAHATokenAddress);
    });

    it("sets the correct MAHAToken address in LockupContractFactory", async () => {
      const mahaTokenAddress = mahaToken.address;

      const recordedMAHATokenAddress = await lockupContractFactory.mahaTokenAddress();
      assert.equal(mahaTokenAddress, recordedMAHATokenAddress);
    });

    it("sets the correct MAHAToken address in CommunityIssuance", async () => {
      // Deploy core contracts and set the MAHAToken address in the CI and MAHAStaking
      const coreContracts = await deploymentHelper.deployLiquityCore();
      await deploymentHelper.connectMAHAContractsToCore(MAHAContracts, coreContracts);

      const mahaTokenAddress = mahaToken.address;

      const recordedMAHATokenAddress = await communityIssuance.mahaToken();
      assert.equal(mahaTokenAddress, recordedMAHATokenAddress);
    });
  });
});
