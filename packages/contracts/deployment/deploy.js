const { TestHelper: th } = require("../utils/testHelpers.js");
const { ethers } = require("hardhat");
const deploymentHelper = require("./deploymentHelpers.js");
const hre = require("hardhat");

const ethParams = require("./params/ethereum");
const localForkParams = require("./params/localFork");
const localParams = require("./params/local");

async function deploy(configParams, network) {
  const date = new Date();
  console.log("now", date.toUTCString());

  const deployerWallet = (await ethers.getSigners())[0];
  const mdh = new deploymentHelper(configParams, deployerWallet, network);

  const deploymentState = mdh.loadPreviousDeployment();

  console.log(`deployer address: ${deployerWallet.address}`);
  assert.equal(deployerWallet.address, configParams.externalAddrs.DEPLOYER);

  deployerETHBalance = await ethers.provider.getBalance(deployerWallet.address);
  console.log(`deployer's ETH balance before deployments: ${deployerETHBalance}`);

  // Deploy core logic contracts
  const liquityCore = await mdh.deployLiquityCoreMainnet(deploymentState);
  await mdh.logContractObjects(liquityCore);

  // Connect all core contracts up
  await mdh.connectCoreContractsMainnet(liquityCore);

  // --- State variables ---

  // TroveManager
  console.log("TroveManager state variables:");
  const totalStakes = await liquityCore.troveManager.totalStakes();
  const totalStakesSnapshot = await liquityCore.troveManager.totalStakesSnapshot();
  const totalCollateralSnapshot = await liquityCore.troveManager.totalCollateralSnapshot();
  th.logBN("Total trove stakes", totalStakes);
  th.logBN("Snapshot of total trove stakes before last liq. ", totalStakesSnapshot);
  th.logBN("Snapshot of total trove collateral before last liq. ", totalCollateralSnapshot);

  const L_ETH = await liquityCore.troveManager.L_ETH();
  const L_ARTHDebt = await liquityCore.troveManager.L_ARTHDebt();
  th.logBN("L_ETH", L_ETH);
  th.logBN("L_ARTHDebt", L_ARTHDebt);

  // Governance
  console.log("Governance variables");
  console.log("getDeploymentStartTime", await liquityCore.governance.getDeploymentStartTime());
  console.log("getBorrowingFeeFloor", await liquityCore.governance.getBorrowingFeeFloor());
  console.log("getRedemptionFeeFloor", await liquityCore.governance.getRedemptionFeeFloor());
  console.log("getMaxBorrowingFee", await liquityCore.governance.getMaxBorrowingFee());
  console.log("getMaxDebtCeiling", await liquityCore.governance.getMaxDebtCeiling());
  console.log("getFund", await liquityCore.governance.getFund());
  console.log("getAllowMinting", await liquityCore.governance.getAllowMinting());
  console.log("getPriceFeed", await liquityCore.governance.getPriceFeed());

  const price = await liquityCore.troveManager.callStatic.fetchPriceFeedPrice();
  th.logBN("price", price);

  // StabilityPool
  console.log("StabilityPool state variables:");
  const P = await liquityCore.stabilityPool.P();
  const currentScale = await liquityCore.stabilityPool.currentScale();
  const currentEpoch = await liquityCore.stabilityPool.currentEpoch();
  const S = await liquityCore.stabilityPool.epochToScaleToSum(currentEpoch, currentScale);
  const G = await liquityCore.stabilityPool.epochToScaleToG(currentEpoch, currentScale);
  th.logBN("Product P", P);
  th.logBN("Current epoch", currentEpoch);
  th.logBN("Current scale", currentScale);
  th.logBN("Sum S, at current epoch and scale", S);
  th.logBN("Sum G, at current epoch and scale", G);

  // CommunityIssuance
  console.log("CommunityIssuance state variables:");
  const totalMAHAIssued = await liquityCore.communityIssuance.totalMAHAIssued();
  th.logBN("Total MAHA issued to depositors / front ends", totalMAHAIssued);

  await liquityCore.communityIssuance.transferOwnership(
    "0x6357EDbfE5aDA570005ceB8FAd3139eF5A8863CC"
  );
  await liquityCore.stabilityPool.transferOwnership("0x6357EDbfE5aDA570005ceB8FAd3139eF5A8863CC");
  await liquityCore.borrowerOperations.transferOwnership(
    "0x6357EDbfE5aDA570005ceB8FAd3139eF5A8863CC"
  );

  // ETH balabce
  deployerETHBalance = await ethers.provider.getBalance(deployerWallet.address);
  console.log(`deployer's ETH balance after deployments: ${deployerETHBalance}`);
}

async function main() {
  const networkName = hre.network.name;
  console.log("--------------------Network name--------------", networkName);

  let params = localForkParams;
  if (networkName === "local") params = localParams;
  if (networkName === "mainnet") params = ethParams;
  await deploy(params, networkName);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
