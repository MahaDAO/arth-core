const { TestHelper: th } = require("../utils/testHelpers.js");
const { ethers } = require("hardhat");
const deploymentHelper = require("./deploymentHelpers.js");
const hre = require("hardhat");

const polygonParams = require("./params/polygon");
const bscTestnetParams = require("./params/bscTestnet");
const bscParams = require("./params/bsc");
const localParams = require("./params/local");

async function deploy(configParams) {
  const date = new Date();
  console.log("now", date.toUTCString());

  const deployerWallet = (await ethers.getSigners())[0];
  const mdh = new deploymentHelper(configParams, deployerWallet);

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
}

async function main() {
  const networkName = hre.network.name;
  console.log("Network name", networkName);

  let params;

  if (networkName === "bscTestnet") params = bscTestnetParams;
  if (networkName === "bsc") params = bscParams;
  if (networkName === "local") params = localParams;
  if (networkName === "polygon") params = polygonParams;
  await deploy(params);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
