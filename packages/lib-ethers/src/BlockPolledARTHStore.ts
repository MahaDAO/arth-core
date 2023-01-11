import { AddressZero } from "@ethersproject/constants";

import {
  Decimal,
  ARTHStoreState,
  ARTHStoreBaseState,
  TroveWithPendingRedistribution,
  StabilityDeposit,
  ARTHStore,
  Fees
} from "@mahadao/arth-base";

import { decimalify, promiseAllValues } from "./_utils";
import { ReadableEthersARTH } from "./ReadableEthersARTH";
import { EthersARTHConnection, _getProvider, _getContracts } from "./EthersARTHConnection";
import { EthersCallOverrides, EthersProvider } from "./types";

/**
 * Extra state added to {@link @mahadao/arth-base#ARTHStoreState} by
 * {@link BlockPolledARTHStore}.
 *
 * @public
 */
export interface BlockPolledARTHStoreExtraState {
  /**
   * Number of block that the store state was fetched from.
   *
   * @remarks
   * May be undefined when the store state is fetched for the first time.
   */
  blockTag?: number;

  /**
   * Timestamp of latest block (number of seconds since epoch).
   */
  blockTimestamp: number;

  /** @internal */
  _feesFactory: (blockTimestamp: number, recoveryMode: boolean) => Fees;
}

/**
 * The type of {@link BlockPolledARTHStore}'s
 * {@link @mahadao/arth-base#ARTHStore.state | state}.
 *
 * @public
 */
export type BlockPolledARTHStoreState = ARTHStoreState<BlockPolledARTHStoreExtraState>;

/**
 * Ethers-based {@link @mahadao/arth-base#ARTHStore} that updates state whenever there's a new
 * block.
 *
 * @public
 */
export class BlockPolledARTHStore extends ARTHStore<BlockPolledARTHStoreExtraState> {
  readonly connection: EthersARTHConnection;

  private readonly _readable: ReadableEthersARTH;
  private readonly _provider: EthersProvider;

  constructor(readable: ReadableEthersARTH) {
    super();

    this.connection = readable.connection;
    this._readable = readable;
    this._provider = _getProvider(readable.connection);
  }

  private async _getRiskiestTroveBeforeRedistribution(
    overrides?: EthersCallOverrides
  ): Promise<TroveWithPendingRedistribution> {
    const riskiestTroves = await this._readable.getTroves(
      { first: 1, sortedBy: "ascendingCollateralRatio", beforeRedistribution: true },
      overrides
    );

    if (riskiestTroves.length === 0) {
      return new TroveWithPendingRedistribution(AddressZero, "nonExistent");
    }

    return riskiestTroves[0];
  }

  private async _get(
    blockTag?: number
  ): Promise<[baseState: ARTHStoreBaseState, extraState: BlockPolledARTHStoreExtraState]> {
    const { userAddress, frontendTag } = this.connection;
    const { governance } = _getContracts(this.connection);
    const { blockTimestamp, _feesFactory, ...baseState } = await promiseAllValues({
      blockTimestamp: this._readable._getBlockTimestamp(blockTag),
      _feesFactory: this._readable._getFeesFactory({ blockTag }),

      price: this._readable.getPrice({ blockTag }),
      numberOfTroves: this._readable.getNumberOfTroves({ blockTag }),
      totalRedistributed: this._readable.getTotalRedistributed({ blockTag }),
      total: this._readable.getTotal({ blockTag }),
      arthInStabilityPool: this._readable.getARTHInStabilityPool({ blockTag }),
      _riskiestTroveBeforeRedistribution: this._getRiskiestTroveBeforeRedistribution({ blockTag }),
      remainingStabilityPoolMAHAReward: this._readable.getRemainingStabilityPoolMAHAReward({
        blockTag
      }),
      governanceAddress: governance.address,
      provider: this._provider,
      frontend: frontendTag
        ? this._readable.getFrontendStatus(frontendTag, { blockTag })
        : { status: "unregistered" as const },

      ...(userAddress
        ? {
            accountBalance: this._provider.getBalance(userAddress, blockTag).then(decimalify),
            arthBalance: this._readable.getARTHBalance(userAddress, { blockTag }),
            collateralSurplusBalance: this._readable.getCollateralSurplusBalance(userAddress, {
              blockTag
            }),
            troveBeforeRedistribution: this._readable.getTroveBeforeRedistribution(userAddress, {
              blockTag
            }),
            stabilityDeposit: this._readable.getStabilityDeposit(userAddress, { blockTag }),
            ownFrontend: this._readable.getFrontendStatus(userAddress, { blockTag }),
          }
        : {
            accountBalance: Decimal.ZERO,
            arthBalance: Decimal.ZERO,
            collateralSurplusBalance: Decimal.ZERO,
            troveBeforeRedistribution: new TroveWithPendingRedistribution(
              AddressZero,
              "nonExistent"
            ),
            stabilityDeposit: new StabilityDeposit(
              Decimal.ZERO,
              Decimal.ZERO,
              Decimal.ZERO,
              Decimal.ZERO,
              AddressZero
            ),
            ownFrontend: { status: "unregistered" as const },
          })
    });

    return [
      {
        ...baseState,
        _feesInNormalMode: _feesFactory(blockTimestamp, false),
      },
      {
        blockTag,
        blockTimestamp,
        _feesFactory
      }
    ];
  }

  /** @internal @override */
  protected _doStart(): () => void {
    this._get().then(state => {
      if (!this._loaded) {
        this._load(...state);
      }
    });

    const blockListener = async (blockTag: number) => {
      const state = await this._get(blockTag);

      if (this._loaded) {
        this._update(...state);
      } else {
        this._load(...state);
      }
    };

    this._provider.on("block", blockListener);

    return () => {
      this._provider.off("block", blockListener);
    };
  }

  /** @internal @override */
  protected _reduceExtra(
    oldState: BlockPolledARTHStoreExtraState,
    stateUpdate: Partial<BlockPolledARTHStoreExtraState>
  ): BlockPolledARTHStoreExtraState {
    return {
      blockTag: stateUpdate.blockTag ?? oldState.blockTag,
      blockTimestamp: stateUpdate.blockTimestamp ?? oldState.blockTimestamp,
      _feesFactory: stateUpdate._feesFactory ?? oldState._feesFactory
    };
  }
}
