const TestDeploymentHelper = require("../utils/testnetDeploymentHelpers.js")

async function deploy(configParams) {
  const date = new Date()
  const [deployerWallet, governanceWallet] = (await ethers.getSigners())

  console.log(`Deploying to testnet on ${date.toUTCString()}\n`)

  const tdh = new TestDeploymentHelper(configParams, deployerWallet, governanceWallet)
  const deploymentState = tdh.loadPreviousDeployment()

  console.log(`Deployer address: ${deployerWallet.address}\n`)
  assert.equal(deployerWallet.address, configParams.liquityAddrs.DEPLOYER)
  assert.equal(governanceWallet.address, configParams.liquityAddrs.GOVERNANCE)

  let deployerETHBalance = await ethers.provider.getBalance(deployerWallet.address)
  console.log(`Deployer ETH balance before deployments: ${deployerETHBalance}\n`)

  // Deploy core logic contracts.
  const liquityCore = await tdh.deployLiquityCoreMainnet(configParams.externalAddrs.TELLOR_MASTER, deploymentState)
  await tdh.logContractObjects(liquityCore)

  // Connect all core contracts up.
  await tdh.connectCoreContractsMainnet(liquityCore, configParams.externalAddrs.CHAINLINK_ETHUSD_PROXY)

  deployerETHBalance = await ethers.provider.getBalance(deployerWallet.address)
  console.log(`Deployer ETH balance after deployments: ${deployerETHBalance}\n`)
}

module.exports = {
  deploy
}