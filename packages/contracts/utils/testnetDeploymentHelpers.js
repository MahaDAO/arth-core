const { BigNumber } = require("ethers");
const fs = require("fs");

const ZERO_ADDRESS = "0x" + "0".repeat(40);
const maxBytes32 = "0x" + "f".repeat(64);

class TestDeploymentHelper {
  constructor(configParams, deployerWallet, governanceWallet) {
    this.hre = require("hardhat");

    this.configParams = configParams;
    this.deployerWallet = deployerWallet;
    this.governanceWallet = governanceWallet;
  }

  // --- Helper methods ---

  async isOwnershipRenounced(contract) {
    const owner = await contract.owner();
    return owner == ZERO_ADDRESS;
  }

  loadPreviousDeployment() {
    let previousDeployment = {};
    if (fs.existsSync(this.configParams.OUTPUT_FILE)) {
      console.log(`Loading previous deployment...`);
      previousDeployment = require("../" + this.configParams.OUTPUT_FILE);
    }

    return previousDeployment;
  }

  saveDeployment(deploymentState) {
    const deploymentStateJSON = JSON.stringify(deploymentState, null, 2);
    fs.writeFileSync(this.configParams.OUTPUT_FILE, deploymentStateJSON);
  }

  async logContractObjects(contracts) {
    console.log(`Contract objects addresses:`);
    for (const contractName of Object.keys(contracts)) {
      console.log(`${contractName}: ${contracts[contractName].address}`);
    }
  }

  // --- Deployer methods ---

  async getFactory(name) {
    const factory = await ethers.getContractFactory(name, this.deployerWallet);
    return factory;
  }

  async sendAndWaitForTransaction(txPromise) {
    const tx = await txPromise;
    const minedTx = await ethers.provider.waitForTransaction(
      tx.hash,
      this.configParams.TX_CONFIRMATIONS
    );
    return minedTx;
  }

  async loadOrDeploy(factory, name, abiName, deploymentState, params = []) {
    if (deploymentState[name] && deploymentState[name].address) {
      console.log(
        `Using previously deployed ${name} contract at address ${deploymentState[name].address}`
      );
      return new ethers.Contract(
        deploymentState[name].address,
        factory.interface,
        this.deployerWallet
      );
    }

    const contract = await factory.deploy(...params, { gasPrice: this.configParams.GAS_PRICE });
    await this.deployerWallet.provider.waitForTransaction(
      contract.deployTransaction.hash,
      this.configParams.TX_CONFIRMATIONS
    );

    deploymentState[name] = {
      abi: abiName,
      address: contract.address,
      txHash: contract.deployTransaction.hash
    };

    this.saveDeployment(deploymentState);

    return contract;
  }

  async deployLiquityCoreMainnet(tellorMasterAddr, deploymentState) {
    // Get contract factories.
    const mockERC20Factory = await this.getFactory("MockERC20");
    const priceFeedFactory = await this.getFactory("PriceFeedTestnet");
    const sortedTrovesFactory = await this.getFactory("SortedTroves");
    const troveManagerFactory = await this.getFactory("TroveManager");
    const activePoolFactory = await this.getFactory("ActivePool");
    const stabilityPoolFactory = await this.getFactory("StabilityPool");
    const gasPoolFactory = await this.getFactory("GasPool");
    const defaultPoolFactory = await this.getFactory("DefaultPool");
    const collSurplusPoolFactory = await this.getFactory("CollSurplusPool");
    const borrowerOperationsFactory = await this.getFactory("BorrowerOperations");
    const hintHelpersFactory = await this.getFactory("HintHelpers");
    const arthTokenFactory = await this.getFactory("ARTHValuecoin");
    const communityIssuanceFactory = await this.getFactory("CommunityIssuance");
    const multiTroveGetterFactory = await this.getFactory("MultiTroveGetter");
    const governanceFactory = await this.getFactory("Governance");
    const mockWETHFactory = await this.getFactory("MockWETH");

    // Deploy txs.
    const priceFeed = await this.loadOrDeploy(
      priceFeedFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}PriceFeed`,
      "PriceFeed",
      deploymentState
    );
    const sortedTroves = await this.loadOrDeploy(
      sortedTrovesFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}SortedTroves`,
      "SortedTroves",
      deploymentState
    );
    const troveManager = await this.loadOrDeploy(
      troveManagerFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}TroveManager`,
      "TroveManager",
      deploymentState
    );
    const activePool = await this.loadOrDeploy(
      activePoolFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}ActivePool`,
      "ActivePool",
      deploymentState
    );
    const stabilityPool = await this.loadOrDeploy(
      stabilityPoolFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}StabilityPool`,
      "StabilityPool",
      deploymentState
    );
    const gasPool = await this.loadOrDeploy(
      gasPoolFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}GasPool`,
      "GasPool",
      deploymentState
    );
    const defaultPool = await this.loadOrDeploy(
      defaultPoolFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}DefaultPool`,
      "DefaultPool",
      deploymentState
    );
    const collSurplusPool = await this.loadOrDeploy(
      collSurplusPoolFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}CollSurplusPool`,
      "CollSurplusPool",
      deploymentState
    );
    const borrowerOperations = await this.loadOrDeploy(
      borrowerOperationsFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}BorrowerOperations`,
      "BorrowerOperations",
      deploymentState
    );
    const hintHelpers = await this.loadOrDeploy(
      hintHelpersFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}HintHelpers`,
      "HintHelpers",
      deploymentState
    );
    const communityIssuance = await this.loadOrDeploy(
      communityIssuanceFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}CommunityIssuance`,
      "CommunityIssuance",
      deploymentState
    );

    const mahaTokenParams = ["MahaDAO", "MAHA"];
    const mahaToken = await this.loadOrDeploy(
      mockERC20Factory,
      "MAHA",
      "IERC20",
      deploymentState,
      mahaTokenParams
    );

    const wrappedETHParams = [
      this.configParams.WRAPPED_ETH.NAME,
      this.configParams.WRAPPED_ETH.SYMBOL
    ];
    const wrappedETH = await this.loadOrDeploy(
      mockWETHFactory,
      "WrappedETH",
      "IWETH",
      deploymentState,
      wrappedETHParams
    );

    const arthTokenParams = [
      troveManager.address,
      stabilityPool.address,
      borrowerOperations.address
    ];
    const arthToken = await this.loadOrDeploy(
      arthTokenFactory,
      "ARTH",
      "ARTHValuecoin",
      deploymentState,
      arthTokenParams
    );

    const multiTroveGetterParams = [troveManager.address, sortedTroves.address];
    const multiTroveGetter = await this.loadOrDeploy(
      multiTroveGetterFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}MultiTroveGetter`,
      "MultiTroveGetter",
      deploymentState,
      multiTroveGetterParams
    );

    const governanceParams = [
      this.governanceWallet.address,
      activePool.address,
      troveManager.address,
      priceFeed.address,
      this.configParams.externalAddrs.ECOSYSTEM_FUND,
      wrappedETH.address
    ];
    const governance = await this.loadOrDeploy(
      governanceFactory,
      `${this.configParams.NATIVE_TOKEN_SYMBOL}Governance`,
      "Governance",
      deploymentState,
      governanceParams
    );

    if (!this.configParams.EXPLORER_BASE_URL) {
      console.log("No Etherscan Url defined, skipping verification");
    } else {
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}PriceFeed`,
        deploymentState
      );
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}SortedTroves`,
        deploymentState
      );
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}TroveManager`,
        deploymentState
      );
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}ActivePool`,
        deploymentState
      );
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}StabilityPool`,
        deploymentState
      );
      await this.verifyContract(`${this.configParams.NATIVE_TOKEN_SYMBOL}GasPool`, deploymentState);
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}DefaultPool`,
        deploymentState
      );
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}CollSurplusPool`,
        deploymentState
      );
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}BorrowerOperations`,
        deploymentState
      );
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}HintHelpers`,
        deploymentState
      );
      await this.verifyContract("ARTH", deploymentState, arthTokenParams);
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}CommunityIssuance`,
        deploymentState
      );
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}MultiTroveGetter`,
        deploymentState,
        multiTroveGetterParams
      );
      await this.verifyContract(
        `${this.configParams.NATIVE_TOKEN_SYMBOL}Governance`,
        deploymentState,
        governanceParams
      );
      await this.verifyContract("MAHA", deploymentState, mahaTokenParams);
      await this.verifyContract("WrappedETH", deploymentState, wrappedETHParams);
    }

    const coreContracts = {
      mahaToken,
      priceFeed,
      arthToken,
      sortedTroves,
      troveManager,
      activePool,
      stabilityPool,
      gasPool,
      defaultPool,
      collSurplusPool,
      borrowerOperations,
      hintHelpers,
      communityIssuance,
      multiTroveGetter,
      governance,
      wrappedETH
    };

    return coreContracts;
  }

  // --- Connector methods ---

  async connectCoreContractsMainnet(contracts, MAHAContracts, chainlinkProxyAddress) {
    const gasPrice = this.configParams.GAS_PRICE;

    // Set TroveManager addr in SortedTroves.
    (await this.isOwnershipRenounced(contracts.sortedTroves)) ||
      (await this.sendAndWaitForTransaction(
        contracts.sortedTroves.setParams(
          maxBytes32,
          contracts.troveManager.address,
          contracts.borrowerOperations.address,
          { gasPrice }
        )
      ));

    // Set contracts in the Trove Manager.
    (await this.isOwnershipRenounced(contracts.troveManager)) ||
      (await this.sendAndWaitForTransaction(
        contracts.troveManager.setAddresses(
          contracts.borrowerOperations.address,
          contracts.activePool.address,
          contracts.defaultPool.address,
          contracts.stabilityPool.address,
          contracts.gasPool.address,
          contracts.collSurplusPool.address,
          contracts.governance.address,
          contracts.arthToken.address,
          contracts.sortedTroves.address,
          { gasPrice }
        )
      ));

    // Set contracts in BorrowerOperations.
    (await this.isOwnershipRenounced(contracts.borrowerOperations)) ||
      (await this.sendAndWaitForTransaction(
        contracts.borrowerOperations.setAddresses(
          contracts.troveManager.address,
          contracts.activePool.address,
          contracts.defaultPool.address,
          contracts.stabilityPool.address,
          contracts.gasPool.address,
          contracts.collSurplusPool.address,
          contracts.governance.address,
          contracts.sortedTroves.address,
          contracts.arthToken.address,
          { gasPrice }
        )
      ));

    // Set contracts in the Pools.
    (await this.isOwnershipRenounced(contracts.stabilityPool)) ||
      (await this.sendAndWaitForTransaction(
        contracts.stabilityPool.setAddresses(
          contracts.borrowerOperations.address,
          contracts.troveManager.address,
          contracts.activePool.address,
          contracts.arthToken.address,
          contracts.sortedTroves.address,
          contracts.governance.address,
          contracts.communityIssuance.address,
          { gasPrice }
        )
      ));

    (await this.isOwnershipRenounced(contracts.activePool)) ||
      (await this.sendAndWaitForTransaction(
        contracts.activePool.setAddresses(
          contracts.borrowerOperations.address,
          contracts.troveManager.address,
          contracts.stabilityPool.address,
          contracts.defaultPool.address,
          { gasPrice }
        )
      ));

    (await this.isOwnershipRenounced(contracts.defaultPool)) ||
      (await this.sendAndWaitForTransaction(
        contracts.defaultPool.setAddresses(
          contracts.troveManager.address,
          contracts.activePool.address,
          { gasPrice }
        )
      ));

    (await this.isOwnershipRenounced(contracts.collSurplusPool)) ||
      (await this.sendAndWaitForTransaction(
        contracts.collSurplusPool.setAddresses(
          contracts.borrowerOperations.address,
          contracts.troveManager.address,
          contracts.activePool.address,
          { gasPrice }
        )
      ));

    // set contracts in HintHelpers
    (await this.isOwnershipRenounced(contracts.hintHelpers)) ||
      (await this.sendAndWaitForTransaction(
        contracts.hintHelpers.setAddresses(
          contracts.sortedTroves.address,
          contracts.troveManager.address,
          contracts.governance.address,
          { gasPrice }
        )
      ));

    await this.sendAndWaitForTransaction(
      contracts.mahaToken.mint(
        contracts.communityIssuance.address,
        BigNumber.from(10).pow(18).mul(1000),
        { gasPrice }
      )
    );

    await this.sendAndWaitForTransaction(
      contracts.communityIssuance.setAddresses(
        contracts.mahaToken.address,
        contracts.stabilityPool.address,
        5 * 24 * 60 * 60,
        { gasPrice }
      )
    );
  }

  // --- Verify on Ethrescan ---

  async verifyContract(name, deploymentState, constructorArguments = []) {
    if (!deploymentState[name] || !deploymentState[name].address) {
      console.error(`  --> No deployment state for contract ${name}!!`);
      return;
    }
    if (deploymentState[name].verification) {
      console.log(`Contract ${name} already verified`);
      return;
    }

    try {
      await this.hre.run("verify:verify", {
        address: deploymentState[name].address,
        constructorArguments
      });
    } catch (error) {
      // If it was already verified, it’s like a success, so let’s move forward and save it
      if (error.name != "NomicLabsHardhatPluginError") {
        console.error(`Error verifying: ${error.name}`);
        console.error(error);
        return;
      }
    }

    deploymentState[
      name
    ].verification = `${this.configParams.EXPLORER_BASE_URL}/${deploymentState[name].address}#code`;

    this.saveDeployment(deploymentState);
  }
}

module.exports = TestDeploymentHelper;
