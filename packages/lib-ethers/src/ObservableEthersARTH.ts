import { BigNumber } from "@ethersproject/bignumber";
import { Event } from "@ethersproject/contracts";

import {
  Decimal,
  ObservableARTH,
  StabilityDeposit,
  Trove,
  TroveWithPendingRedistribution
} from "@mahadao/arth-base";

import { _getContracts, _requireAddress } from "./EthersARTHConnection";
import { ReadableEthersARTH } from "./ReadableEthersARTH";

const debouncingDelayMs = 50;

const debounce = (listener: (latestBlock: number) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let latestBlock = 0;

  return (...args: unknown[]) => {
    const event = args[args.length - 1] as Event;

    if (event.blockNumber !== undefined && event.blockNumber > latestBlock) {
      latestBlock = event.blockNumber;
    }

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      listener(latestBlock);
      timeoutId = undefined;
    }, debouncingDelayMs);
  };
};

/** @alpha */
export class ObservableEthersARTH implements ObservableARTH {
  private readonly _readable: ReadableEthersARTH;

  constructor(readable: ReadableEthersARTH) {
    this._readable = readable;
  }

  watchTotalRedistributed(
    onTotalRedistributedChanged: (totalRedistributed: Trove) => void
  ): () => void {
    const { activePool, defaultPool } = _getContracts(this._readable.connection);
    const etherSent = activePool.filters.EtherSent();

    const redistributionListener = debounce((blockTag: number) => {
      this._readable.getTotalRedistributed({ blockTag }).then(onTotalRedistributedChanged);
    });

    const etherSentListener = (toAddress: string, _amount: BigNumber, event: Event) => {
      if (toAddress === defaultPool.address) {
        redistributionListener(event);
      }
    };

    activePool.on(etherSent, etherSentListener);

    return () => {
      activePool.removeListener(etherSent, etherSentListener);
    };
  }

  watchTroveWithoutRewards(
    onTroveChanged: (trove: TroveWithPendingRedistribution) => void,
    address?: string
  ): () => void {
    address ??= _requireAddress(this._readable.connection);

    const { troveManager, borrowerOperations } = _getContracts(this._readable.connection);
    const troveUpdatedByTroveManager = troveManager.filters.TroveUpdated(address);
    const troveUpdatedByBorrowerOperations = borrowerOperations.filters.TroveUpdated(address);

    const troveListener = debounce((blockTag: number) => {
      this._readable.getTroveBeforeRedistribution(address, { blockTag }).then(onTroveChanged);
    });

    troveManager.on(troveUpdatedByTroveManager, troveListener);
    borrowerOperations.on(troveUpdatedByBorrowerOperations, troveListener);

    return () => {
      troveManager.removeListener(troveUpdatedByTroveManager, troveListener);
      borrowerOperations.removeListener(troveUpdatedByBorrowerOperations, troveListener);
    };
  }

  watchNumberOfTroves(onNumberOfTrovesChanged: (numberOfTroves: number) => void): () => void {
    const { troveManager } = _getContracts(this._readable.connection);
    const { TroveUpdated } = troveManager.filters;
    const troveUpdated = TroveUpdated();

    const troveUpdatedListener = debounce((blockTag: number) => {
      this._readable.getNumberOfTroves({ blockTag }).then(onNumberOfTrovesChanged);
    });

    troveManager.on(troveUpdated, troveUpdatedListener);

    return () => {
      troveManager.removeListener(troveUpdated, troveUpdatedListener);
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  watchPrice(onPriceChanged: (price: Decimal) => void): () => void {
    // TODO revisit
    // We no longer have our own PriceUpdated events. If we want to implement this in an event-based
    // manner, we'll need to listen to aggregator events directly. Or we could do polling.
    throw new Error("Method not implemented.");
  }

  watchTotal(onTotalChanged: (total: Trove) => void): () => void {
    const { troveManager } = _getContracts(this._readable.connection);
    const { TroveUpdated } = troveManager.filters;
    const troveUpdated = TroveUpdated();

    const totalListener = debounce((blockTag: number) => {
      this._readable.getTotal({ blockTag }).then(onTotalChanged);
    });

    troveManager.on(troveUpdated, totalListener);

    return () => {
      troveManager.removeListener(troveUpdated, totalListener);
    };
  }

  watchStabilityDeposit(
    onStabilityDepositChanged: (stabilityDeposit: StabilityDeposit) => void,
    address?: string
  ): () => void {
    address ??= _requireAddress(this._readable.connection);

    const { activePool, stabilityPool } = _getContracts(this._readable.connection);
    const { UserDepositChanged } = stabilityPool.filters;
    const { EtherSent } = activePool.filters;

    const userDepositChanged = UserDepositChanged(address);
    const etherSent = EtherSent();

    const depositListener = debounce((blockTag: number) => {
      this._readable.getStabilityDeposit(address, { blockTag }).then(onStabilityDepositChanged);
    });

    const etherSentListener = (toAddress: string, _amount: BigNumber, event: Event) => {
      if (toAddress === stabilityPool.address) {
        // Liquidation while Stability Pool has some deposits
        // There may be new gains
        depositListener(event);
      }
    };

    stabilityPool.on(userDepositChanged, depositListener);
    activePool.on(etherSent, etherSentListener);

    return () => {
      stabilityPool.removeListener(userDepositChanged, depositListener);
      activePool.removeListener(etherSent, etherSentListener);
    };
  }

  watchARTHInStabilityPool(
    onARTHInStabilityPoolChanged: (arthInStabilityPool: Decimal) => void
  ): () => void {
    const { arthToken, stabilityPool } = _getContracts(this._readable.connection);
    const { Transfer } = arthToken.filters;

    const transferARTHFromStabilityPool = Transfer(stabilityPool.address);
    const transferARTHToStabilityPool = Transfer(null, stabilityPool.address);

    const stabilityPoolARTHFilters = [transferARTHFromStabilityPool, transferARTHToStabilityPool];

    const stabilityPoolARTHListener = debounce((blockTag: number) => {
      this._readable.getARTHInStabilityPool({ blockTag }).then(onARTHInStabilityPoolChanged);
    });

    stabilityPoolARTHFilters.forEach(filter => arthToken.on(filter, stabilityPoolARTHListener));

    return () =>
      stabilityPoolARTHFilters.forEach(filter =>
        arthToken.removeListener(filter, stabilityPoolARTHListener)
      );
  }

  watchARTHBalance(onARTHBalanceChanged: (balance: Decimal) => void, address?: string): () => void {
    address ??= _requireAddress(this._readable.connection);

    const { arthToken } = _getContracts(this._readable.connection);
    const { Transfer } = arthToken.filters;
    const transferARTHFromUser = Transfer(address);
    const transferARTHToUser = Transfer(null, address);

    const arthTransferFilters = [transferARTHFromUser, transferARTHToUser];

    const arthTransferListener = debounce((blockTag: number) => {
      this._readable.getARTHBalance(address, { blockTag }).then(onARTHBalanceChanged);
    });

    arthTransferFilters.forEach(filter => arthToken.on(filter, arthTransferListener));

    return () =>
      arthTransferFilters.forEach(filter => arthToken.removeListener(filter, arthTransferListener));
  }
}
