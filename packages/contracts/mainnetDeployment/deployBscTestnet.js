const { deploy } = require('./testnetDeployment.js')
const configParams = require("./deploymentParams.bscTestnet.js")

async function main() {
  await deploy(configParams)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
