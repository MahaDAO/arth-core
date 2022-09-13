import { Block, BlockTag } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";

import { Decimal } from "@mahadao/arth-base";

// import devOrNull from "../deployments/dev.json";
// import goerli from "../deployments/goerli.json";
// import kovan from "../deployments/kovan.json";
// import rinkeby from "../deployments/rinkeby.json";
// import ropsten from "../deployments/ropsten.json";
import mainnet from "../deployments/mainnet.json";
// import kiln from "../deployments/kiln.json";

import { numberify, panic } from "./_utils";
import { EthersProvider, EthersSigner } from "./types";

import {
  _connectToContracts,
  _ARTHContractAddresses,
  _ARTHContracts,
  _ARTHDeploymentJSON
} from "./contracts";

import { _connectToMulticall, _Multicall } from "./_Multicall";

// const dev = devOrNull as _ARTHDeploymentJSON | null;

const deployments: {
  [chainId: number]: _ARTHDeploymentJSON | undefined;
} = {
  [mainnet.chainId]: mainnet
  // [ropsten.chainId]: ropsten,
  // [rinkeby.chainId]: rinkeby,
  // [goerli.chainId]: goerli,
  // [kovan.chainId]: kovan,
  // [kiln.chainId]: kiln,

  // ...(dev !== null ? { [dev.chainId]: dev } : {})
};

declare const brand: unique symbol;

const branded = <T>(t: Omit<T, typeof brand>): T => t as T;

/**
 * Information about a connection to the ARTH protocol.
 *
 * @remarks
 * Provided for debugging / informational purposes.
 *
 * Exposed through {@link ReadableEthersARTH.connection} and {@link EthersARTH.connection}.
 *
 * @public
 */
export interface EthersARTHConnection extends EthersARTHConnectionOptionalParams {
  /** Ethers `Provider` used for connecting to the network. */
  readonly provider: EthersProvider;

  /** Ethers `Signer` used for sending transactions. */
  readonly signer?: EthersSigner;

  /** Chain ID of the connected network. */
  readonly chainId: number;

  /** Version of the ARTH contracts (Git commit hash). */
  readonly version: string;

  /** Date when the ARTH contracts were deployed. */
  readonly deploymentDate: Date;

  /** Number of block in which the first ARTH contract was deployed. */
  readonly startBlock: number;

  /** Time period (in seconds) after `deploymentDate` during which redemptions are disabled. */
  readonly bootstrapPeriod: number;

  /** Total amount of MAHA allocated for rewarding stability depositors. */
  readonly totalStabilityPoolMAHAReward: Decimal;

  // /** Amount of MAHA collectively rewarded to stakers of the liquidity mining pool per second. */
  // readonly liquidityMiningMAHARewardRate: Decimal;

  /** A mapping of ARTH contracts' names to their addresses. */
  readonly addresses: Record<string, string>;

  /** @internal */
  readonly _priceFeedIsTestnet: boolean;

  /** @internal */
  readonly _isDev: boolean;

  /** @internal */
  readonly [brand]: unique symbol;
}

/** @internal */
export interface _InternalEthersARTHConnection extends EthersARTHConnection {
  readonly addresses: _ARTHContractAddresses;
  readonly _contracts: _ARTHContracts;
  readonly _multicall?: _Multicall;
}

const connectionFrom = (
  provider: EthersProvider,
  signer: EthersSigner | undefined,
  _contracts: _ARTHContracts,
  _multicall: _Multicall | undefined,
  { deploymentDate, totalStabilityPoolMAHAReward, ...deployment }: _ARTHDeploymentJSON,
  optionalParams?: EthersARTHConnectionOptionalParams
): _InternalEthersARTHConnection => {
  if (
    optionalParams &&
    optionalParams.useStore !== undefined &&
    !validStoreOptions.includes(optionalParams.useStore)
  ) {
    throw new Error(`Invalid useStore value ${optionalParams.useStore}`);
  }

  return branded({
    provider,
    signer,
    _contracts,
    _multicall,
    deploymentDate: new Date(deploymentDate),
    totalStabilityPoolMAHAReward: Decimal.from(totalStabilityPoolMAHAReward),
    ...deployment,
    ...optionalParams
  });
};

/** @internal */
export const _getContracts = (connection: EthersARTHConnection): _ARTHContracts =>
  (connection as _InternalEthersARTHConnection)._contracts;

const getMulticall = (connection: EthersARTHConnection): _Multicall | undefined =>
  (connection as _InternalEthersARTHConnection)._multicall;

const getTimestampFromBlock = ({ timestamp }: Block) => timestamp;

/** @internal */
export const _getBlockTimestamp = (
  connection: EthersARTHConnection,
  blockTag: BlockTag = "latest"
): Promise<number> =>
  // Get the timestamp via a contract call whenever possible, to make it batchable with other calls
  getMulticall(connection)?.getCurrentBlockTimestamp({ blockTag }).then(numberify) ??
  _getProvider(connection).getBlock(blockTag).then(getTimestampFromBlock);

/** @internal */
export const _requireSigner = (connection: EthersARTHConnection): EthersSigner =>
  connection.signer ?? panic(new Error("Must be connected through a Signer"));

/** @internal */
export const _getProvider = (connection: EthersARTHConnection): EthersProvider =>
  connection.provider;

// TODO parameterize error message?
/** @internal */
export const _requireAddress = (
  connection: EthersARTHConnection,
  overrides?: { from?: string }
): string =>
  overrides?.from ?? connection.userAddress ?? panic(new Error("A user address is required"));

/** @internal */
export const _requireFrontendAddress = (connection: EthersARTHConnection): string =>
  connection.frontendTag ?? panic(new Error("A frontend address is required"));

/** @internal */
export const _usingStore = (
  connection: EthersARTHConnection
): connection is EthersARTHConnection & { useStore: EthersARTHStoreOption } =>
  connection.useStore !== undefined;

/**
 * Thrown when trying to connect to a network where ARTH is not deployed.
 *
 * @remarks
 * Thrown by {@link ReadableEthersARTH.(connect:2)} and {@link EthersARTH.(connect:2)}.
 *
 * @public
 */
export class UnsupportedNetworkError extends Error {
  /** Chain ID of the unsupported network. */
  readonly chainId: number;

  /** @internal */
  constructor(chainId: number) {
    super(`Unsupported network (chainId = ${chainId})`);
    this.name = "UnsupportedNetworkError";
    this.chainId = chainId;
  }
}

const getProviderAndSigner = (
  signerOrProvider: EthersSigner | EthersProvider
): [provider: EthersProvider, signer: EthersSigner | undefined] => {
  const provider: EthersProvider = Signer.isSigner(signerOrProvider)
    ? signerOrProvider.provider ?? panic(new Error("Signer must have a Provider"))
    : signerOrProvider;

  const signer = Signer.isSigner(signerOrProvider) ? signerOrProvider : undefined;

  return [provider, signer];
};

/** @internal */
export const _connectToDeployment = (
  deployment: _ARTHDeploymentJSON,
  signerOrProvider: EthersSigner | EthersProvider,
  optionalParams?: EthersARTHConnectionOptionalParams
): EthersARTHConnection =>
  connectionFrom(
    ...getProviderAndSigner(signerOrProvider),
    _connectToContracts(signerOrProvider, deployment),
    undefined,
    deployment,
    optionalParams
  );

/**
 * Possible values for the optional
 * {@link EthersARTHConnectionOptionalParams.useStore | useStore}
 * connection parameter.
 *
 * @remarks
 * Currently, the only supported value is `"blockPolled"`, in which case a
 * {@link BlockPolledARTHStore} will be created.
 *
 * @public
 */
export type EthersARTHStoreOption = "blockPolled";

const validStoreOptions = ["blockPolled"];

/**
 * Optional parameters of {@link ReadableEthersARTH.(connect:2)} and
 * {@link EthersARTH.(connect:2)}.
 *
 * @public
 */
export interface EthersARTHConnectionOptionalParams {
  /**
   * Address whose Trove, Stability Deposit, MAHA Stake and balances will be read by default.
   *
   * @remarks
   * For example {@link EthersARTH.getTrove | getTrove(address?)} will return the Trove owned by
   * `userAddress` when the `address` parameter is omitted.
   *
   * Should be omitted when connecting through a {@link EthersSigner | Signer}. Instead `userAddress`
   * will be automatically determined from the `Signer`.
   */
  readonly userAddress?: string;

  /**
   * Address that will receive MAHA rewards from newly created Stability Deposits by default.
   *
   * @remarks
   * For example
   * {@link EthersARTH.depositARTHInStabilityPool | depositARTHInStabilityPool(amount, frontendTag?)}
   * will tag newly made Stability Deposits with this address when its `frontendTag` parameter is
   * omitted.
   */
  readonly frontendTag?: string;

  /**
   * Create a {@link @mahadao/arth-base#ARTHStore} and expose it as the `store` property.
   *
   * @remarks
   * When set to one of the available {@link EthersARTHStoreOption | options},
   * {@link ReadableEthersARTH.(connect:2) | ReadableEthersARTH.connect()} will return a
   * {@link ReadableEthersARTHWithStore}, while
   * {@link EthersARTH.(connect:2) | EthersARTH.connect()} will return an
   * {@link EthersARTHWithStore}.
   *
   * Note that the store won't start monitoring the blockchain until its
   * {@link @mahadao/arth-base#ARTHStore.start | start()} function is called.
   */
  readonly useStore?: EthersARTHStoreOption;
}

/** @internal */
export function _connectByChainId<T>(
  provider: EthersProvider,
  signer: EthersSigner | undefined,
  chainId: number,
  optionalParams: EthersARTHConnectionOptionalParams & { useStore: T }
): EthersARTHConnection & { useStore: T };

/** @internal */
export function _connectByChainId(
  provider: EthersProvider,
  signer: EthersSigner | undefined,
  chainId: number,
  optionalParams?: EthersARTHConnectionOptionalParams
): EthersARTHConnection;

/** @internal */
export function _connectByChainId(
  provider: EthersProvider,
  signer: EthersSigner | undefined,
  chainId: number,
  optionalParams?: EthersARTHConnectionOptionalParams
): EthersARTHConnection {
  const deployment: _ARTHDeploymentJSON =
    deployments[chainId] ?? panic(new UnsupportedNetworkError(chainId));

  return connectionFrom(
    provider,
    signer,
    _connectToContracts(signer ?? provider, deployment),
    _connectToMulticall(signer ?? provider, chainId),
    deployment,
    optionalParams
  );
}

/** @internal */
export const _connect = async (
  signerOrProvider: EthersSigner | EthersProvider,
  optionalParams?: EthersARTHConnectionOptionalParams
): Promise<EthersARTHConnection> => {
  const [provider, signer] = getProviderAndSigner(signerOrProvider);

  if (signer) {
    if (optionalParams?.userAddress !== undefined) {
      throw new Error("Can't override userAddress when connecting through Signer");
    }

    optionalParams = {
      ...optionalParams,
      userAddress: await signer.getAddress()
    };
  }

  return _connectByChainId(provider, signer, (await provider.getNetwork()).chainId, optionalParams);
};
