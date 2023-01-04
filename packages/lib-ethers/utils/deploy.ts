import { Signer } from "@ethersproject/abstract-signer";
import { ContractTransaction, ContractFactory, Overrides } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";

import { Decimal } from "@mahadao/arth-base";

import polygonParams from"../../contracts/deployment/params/polygon";
import bscTestnetParams from"../../contracts/deployment/params/bscTestnet";
import ethParams from"../../contracts/deployment/params/ethereum";
import bscParams from"../../contracts/deployment/params/bsc";
import localParams from"../../contracts/deployment/params/local";

import {
  _ARTHContractAddresses,
  _ARTHContracts,
  _ARTHDeploymentJSON,
  _connectToContracts
} from "../src/contracts";

let silent = true;

export const log = (...args: unknown[]): void => {
  if (!silent) {
    console.log(...args);
  }
};

export const setSilent = (s: boolean): void => {
  silent = s;
};

const deployContractAndGetBlockNumber = async (
  deployer: Signer,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  contractName: string,
  ...args: unknown[]
): Promise<[address: string, blockNumber: number]> => {
  log(`Deploying ${contractName} ...`);
  const contract = await (await getContractFactory(contractName, deployer)).deploy(...args);

  log(`Waiting for transaction ${contract.deployTransaction.hash} ...`);
  const receipt = await contract.deployTransaction.wait();

  log({
    contractAddress: contract.address,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toNumber()
  });

  log();

  return [contract.address, receipt.blockNumber];
};

const deployContract: (
  ...p: Parameters<typeof deployContractAndGetBlockNumber>
) => Promise<string> = (...p) => deployContractAndGetBlockNumber(...p).then(([a]) => a);

const deployContracts = async (
  deployer: Signer,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  priceFeedIsTestnet = true,
  overrides?: Overrides
): Promise<[addresses: Omit<_ARTHContractAddresses, "uniToken">, startBlock: number]> => {
  let params;
  const network = await deployer.provider?.getNetwork()

  if (network?.name === "bscTestnet") params = bscTestnetParams;
  else if (network?.name === "bsc") params = bscParams;
  else if (network?.name === "local") params = localParams;
  else if (network?.name === "mainnet") params = ethParams;
  else if (network?.name === "polygon") params = polygonParams;
  else params = localParams;
  const [activePoolAddress, startBlock] = await deployContractAndGetBlockNumber(
    deployer,
    getContractFactory,
    "ActivePool",
    { ...overrides }
  );

  // const priceFeed = params.externalAddrs.PRICE_FEED ? params.externalAddrs.PRICE_FEED : await deployContract(
  //   deployer,
  //   getContractFactory,
  //   priceFeedIsTestnet ? "PriceFeedTestnet" : "PriceFeed",
  //   { ...overrides }
  // )

  const priceFeed = await (await getContractFactory("PriceFeedTestnet", deployer)).deploy();
  
  const addresses = {
    activePool: activePoolAddress,
    borrowerOperations: await deployContract(deployer, getContractFactory, "BorrowerOperations", {
      ...overrides
    }),
    troveManager: await deployContract(deployer, getContractFactory, "TroveManager", {
      ...overrides
    }),
    collSurplusPool: await deployContract(deployer, getContractFactory, "CollSurplusPool", {
      ...overrides
    }),
    mahaToken: params.externalAddrs.MAHA ? params.externalAddrs.MAHA : await deployContract(
      deployer,
      getContractFactory,
      "MockERC20",
      "MahaDAO",
      "MAHA",
      { ...overrides }
    ),
    stabilityPool: await deployContract(deployer, getContractFactory, "StabilityPool", {
      ...overrides
    }),
    
    defaultPool: await deployContract(deployer, getContractFactory, "DefaultPool", { ...overrides }),
    hintHelpers: await deployContract(deployer, getContractFactory, "HintHelpers", { ...overrides }),
    priceFeed: priceFeed.address,
    sortedTroves: await deployContract(deployer, getContractFactory, "SortedTroves", {
      ...overrides
    }),
    
    gasPool: await deployContract(deployer, getContractFactory, "GasPool", {
      ...overrides
    }),
  };
  const governance = await deployContract(deployer, getContractFactory, 
    "Governance",
    params.externalAddrs.TIMELOCK,
    addresses.troveManager,
    addresses.borrowerOperations,
    addresses.priceFeed,
    params.externalAddrs.ECOSYSTEM_FUND,
    "0",
    {...overrides}
  )
  priceFeed
  return [
    {
      ...addresses,
      communityIssuance: await deployContract(deployer, getContractFactory, "CommunityIssuance",
        addresses.mahaToken,
        addresses.stabilityPool,
        params.COMMUNITY_ISSUANCE_REWARDS_DURATION,
        { ...overrides }
      ),
      multiTroveGetter: await deployContract(
        deployer,
        getContractFactory,
        "MultiTroveGetter",
        addresses.troveManager,
        addresses.sortedTroves,
        { ...overrides }
      ),
      governance,
      arthToken: await deployContract(
        deployer,
        getContractFactory,
        "ARTHValuecoin",
        params.externalAddrs.TIMELOCK,
        { ...overrides }
      ),
    },

    startBlock
  ];
};

export const deployTellorCaller = (
  deployer: Signer,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  tellorAddress: string,
  overrides?: Overrides
): Promise<string> =>
  deployContract(deployer, getContractFactory, "TellorCaller", tellorAddress, { ...overrides });

const connectContracts = async (
  {
    activePool,
    borrowerOperations,
    troveManager,
    arthToken,
    collSurplusPool,
    communityIssuance,
    defaultPool,
    mahaToken,
    hintHelpers,
    priceFeed,
    sortedTroves,
    stabilityPool,
    gasPool,
    governance
  }: _ARTHContracts,
  deployer: Signer,
  overrides?: Overrides
) => {
  if (!deployer.provider) {
    throw new Error("Signer must have a provider.");
  }



  const txCount = await deployer.provider.getTransactionCount(deployer.getAddress());

  const connections: ((nonce: number) => Promise<ContractTransaction>)[] = [
    nonce =>
      sortedTroves.setParams(1e6, troveManager.address, borrowerOperations.address, {
        ...overrides,
        nonce
      }),

    // nonce => governance.setPriceFeed(priceFeed.address, {...overrides,
    //   nonce
    // }),

    nonce =>
      troveManager.setAddresses(
        borrowerOperations.address,
        activePool.address,
        defaultPool.address,
        stabilityPool.address,
        gasPool.address,
        collSurplusPool.address,
        governance.address,
        arthToken.address,
        sortedTroves.address,
        { ...overrides, nonce }
      ),

    nonce =>
      borrowerOperations.setAddresses(
        troveManager.address,
        activePool.address,
        defaultPool.address,
        stabilityPool.address,
        gasPool.address,
        collSurplusPool.address,
        governance.address,
        sortedTroves.address,
        arthToken.address,
        { ...overrides, nonce }
      ),

    nonce =>
      stabilityPool.setAddresses(
        borrowerOperations.address,
        troveManager.address,
        activePool.address,
        arthToken.address,
        sortedTroves.address,
        governance.address,
        communityIssuance.address,
        { ...overrides, nonce }
      ),

    nonce =>
      activePool.setAddresses(
        borrowerOperations.address,
        troveManager.address,
        stabilityPool.address,
        defaultPool.address,
        { ...overrides, nonce }
      ),

    nonce =>
      defaultPool.setAddresses(troveManager.address, activePool.address, {
        ...overrides,
        nonce
      }),

    nonce =>
      collSurplusPool.setAddresses(
        borrowerOperations.address,
        troveManager.address,
        activePool.address,
        { ...overrides, nonce }
      ),

    nonce =>
      hintHelpers.setAddresses(sortedTroves.address, troveManager.address, {
        ...overrides,
        nonce
      }),

    // nonce =>
    //   communityIssuance.setAddresses(mahaToken.address, stabilityPool.address, {
    //     ...overrides,
    //     nonce
    //   })
  ];

  const txs = await Promise.all(connections.map((connect, i) => connect(txCount + i)));

  let i = 0;
  await Promise.all(txs.map(tx => tx.wait().then(() => log(`Connected ${++i}`))));
};

export const deployAndSetupContracts = async (
  deployer: Signer,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  _priceFeedIsTestnet = true,
  _isDev = true,
  wethAddress?: string,
  overrides?: Overrides
): Promise<_ARTHDeploymentJSON> => {
  if (!deployer.provider) {
    throw new Error("Signer must have a provider.");
  }

  log("Deploying contracts...");
  log();

  const deployment: _ARTHDeploymentJSON = {
    chainId: await deployer.getChainId(),
    version: "unknown",
    deploymentDate: new Date().getTime(),
    bootstrapPeriod: 0,
    totalStabilityPoolMAHAReward: "0",
    _priceFeedIsTestnet,
    _isDev,

    ...(await deployContracts(deployer, getContractFactory, _priceFeedIsTestnet, overrides).then(
      async ([addresses, startBlock]) => ({
        startBlock,
        addresses
      })
    ))
  };

  const contracts = _connectToContracts(deployer, deployment);

  log("Connecting contracts...");
  await connectContracts(contracts, deployer, overrides);

  // const mahaTokenDeploymentTime = await contracts.mahaToken.getDeploymentStartTime();
  const bootstrapPeriod = await contracts.troveManager.BOOTSTRAP_PERIOD();
  const totalStabilityPoolMAHAReward = await contracts.communityIssuance.totalMAHAIssued();

  return {
    ...deployment,
    // deploymentDate: mahaTokenDeploymentTime.toNumber() * 1000,
    bootstrapPeriod: bootstrapPeriod.toNumber(),
    totalStabilityPoolMAHAReward: `${Decimal.fromBigNumberString(
      totalStabilityPoolMAHAReward.toHexString()
    )}`
  };
};
