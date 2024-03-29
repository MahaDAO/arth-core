
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Log } from "@ethersproject/abstract-provider";
import { BytesLike } from "@ethersproject/bytes";
import {
  Overrides,
  CallOverrides,
  PayableOverrides,
  EventFilter
} from "@ethersproject/contracts";

import { _TypedARTHContract, _TypedLogDescription } from "../src/contracts";

interface ActivePoolCalls {
  NAME(_overrides?: CallOverrides): Promise<string>;
  borrowerOperationsAddress(_overrides?: CallOverrides): Promise<string>;
  defaultPoolAddress(_overrides?: CallOverrides): Promise<string>;
  getARTHDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  getETH(_overrides?: CallOverrides): Promise<BigNumber>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  owner(_overrides?: CallOverrides): Promise<string>;
  stabilityPoolAddress(_overrides?: CallOverrides): Promise<string>;
  troveManagerAddress(_overrides?: CallOverrides): Promise<string>;
}

interface ActivePoolTransactions {
  decreaseARTHDebt(_amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  increaseARTHDebt(_amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  sendETH(_account: string, _amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  setAddresses(_borrowerOperationsAddress: string, _troveManagerAddress: string, _stabilityPoolAddress: string, _defaultPoolAddress: string, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
}

export interface ActivePool
  extends _TypedARTHContract<ActivePoolCalls, ActivePoolTransactions> {
  readonly filters: {
    ARTHBalanceUpdated(_newBalance?: null): EventFilter;
    ActivePoolARTHDebtUpdated(_ARTHDebt?: null): EventFilter;
    ActivePoolAddressChanged(_newActivePoolAddress?: null): EventFilter;
    ActivePoolETHBalanceUpdated(_ETH?: null): EventFilter;
    BorrowerOperationsAddressChanged(_newBorrowerOperationsAddress?: null): EventFilter;
    DefaultPoolAddressChanged(_newDefaultPoolAddress?: null): EventFilter;
    ETHBalanceUpdated(_newBalance?: null): EventFilter;
    EtherSent(_to?: null, _amount?: null): EventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    StabilityPoolAddressChanged(_newStabilityPoolAddress?: null): EventFilter;
    TroveManagerAddressChanged(_newTroveManagerAddress?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "ARTHBalanceUpdated"): _TypedLogDescription<{ _newBalance: BigNumber }>[];
  extractEvents(logs: Log[], name: "ActivePoolARTHDebtUpdated"): _TypedLogDescription<{ _ARTHDebt: BigNumber }>[];
  extractEvents(logs: Log[], name: "ActivePoolAddressChanged"): _TypedLogDescription<{ _newActivePoolAddress: string }>[];
  extractEvents(logs: Log[], name: "ActivePoolETHBalanceUpdated"): _TypedLogDescription<{ _ETH: BigNumber }>[];
  extractEvents(logs: Log[], name: "BorrowerOperationsAddressChanged"): _TypedLogDescription<{ _newBorrowerOperationsAddress: string }>[];
  extractEvents(logs: Log[], name: "DefaultPoolAddressChanged"): _TypedLogDescription<{ _newDefaultPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "ETHBalanceUpdated"): _TypedLogDescription<{ _newBalance: BigNumber }>[];
  extractEvents(logs: Log[], name: "EtherSent"): _TypedLogDescription<{ _to: string; _amount: BigNumber }>[];
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "StabilityPoolAddressChanged"): _TypedLogDescription<{ _newStabilityPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "TroveManagerAddressChanged"): _TypedLogDescription<{ _newTroveManagerAddress: string }>[];
}

interface BorrowerOperationsCalls {
  ARTH_GAS_COMPENSATION(_overrides?: CallOverrides): Promise<BigNumber>;
  BORROWING_FEE_FLOOR(_overrides?: CallOverrides): Promise<BigNumber>;
  CCR(_overrides?: CallOverrides): Promise<BigNumber>;
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  MCR(_overrides?: CallOverrides): Promise<BigNumber>;
  MIN_NET_DEBT(_overrides?: CallOverrides): Promise<BigNumber>;
  NAME(_overrides?: CallOverrides): Promise<string>;
  PERCENT_DIVISOR(_overrides?: CallOverrides): Promise<BigNumber>;
  _100pct(_overrides?: CallOverrides): Promise<BigNumber>;
  activePool(_overrides?: CallOverrides): Promise<string>;
  arthToken(_overrides?: CallOverrides): Promise<string>;
  defaultPool(_overrides?: CallOverrides): Promise<string>;
  frontEnds(arg0: string, _overrides?: CallOverrides): Promise<boolean>;
  getBorrowingFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  getCompositeDebt(_debt: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  getEntireSystemColl(_overrides?: CallOverrides): Promise<BigNumber>;
  getEntireSystemDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  getMaxBorrowingFee(_overrides?: CallOverrides): Promise<BigNumber>;
  getPriceFeed(_overrides?: CallOverrides): Promise<string>;
  getRedemptionFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  governance(_overrides?: CallOverrides): Promise<string>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  owner(_overrides?: CallOverrides): Promise<string>;
  sortedTroves(_overrides?: CallOverrides): Promise<string>;
  troveManager(_overrides?: CallOverrides): Promise<string>;
}

interface BorrowerOperationsTransactions {
  addColl(_upperHint: string, _lowerHint: string, _overrides?: PayableOverrides): Promise<void>;
  adjustTrove(_maxFeePercentage: BigNumberish, _collWithdrawal: BigNumberish, _ARTHChange: BigNumberish, _isDebtIncrease: boolean, _upperHint: string, _lowerHint: string, _overrides?: PayableOverrides): Promise<void>;
  claimCollateral(_overrides?: Overrides): Promise<void>;
  closeTrove(_overrides?: Overrides): Promise<void>;
  fetchPriceFeedPrice(_overrides?: Overrides): Promise<BigNumber>;
  moveETHGainToTrove(_borrower: string, _upperHint: string, _lowerHint: string, _overrides?: PayableOverrides): Promise<void>;
  openTrove(_maxFeePercentage: BigNumberish, _ARTHAmount: BigNumberish, _upperHint: string, _lowerHint: string, _frontEndTag: string, _overrides?: PayableOverrides): Promise<void>;
  openTroveFor(_who: string, _maxFeePercentage: BigNumberish, _ARTHAmount: BigNumberish, _upperHint: string, _lowerHint: string, _frontEndTag: string, _overrides?: PayableOverrides): Promise<void>;
  registerFrontEnd(_overrides?: Overrides): Promise<void>;
  repayARTH(_ARTHAmount: BigNumberish, _upperHint: string, _lowerHint: string, _overrides?: Overrides): Promise<void>;
  setAddresses(_troveManagerAddress: string, _activePoolAddress: string, _defaultPoolAddress: string, _stabilityPoolAddress: string, _gasPoolAddress: string, _collSurplusPoolAddress: string, _governanceAddress: string, _sortedTrovesAddress: string, _arthTokenAddress: string, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
  withdrawARTH(_maxFeePercentage: BigNumberish, _ARTHAmount: BigNumberish, _upperHint: string, _lowerHint: string, _overrides?: Overrides): Promise<void>;
  withdrawColl(_collWithdrawal: BigNumberish, _upperHint: string, _lowerHint: string, _overrides?: Overrides): Promise<void>;
}

export interface BorrowerOperations
  extends _TypedARTHContract<BorrowerOperationsCalls, BorrowerOperationsTransactions> {
  readonly filters: {
    ARTHBorrowingFeePaid(_borrower?: string | null, _ARTHFee?: null): EventFilter;
    ARTHTokenAddressChanged(_arthTokenAddress?: null): EventFilter;
    ActivePoolAddressChanged(_activePoolAddress?: null): EventFilter;
    CollSurplusPoolAddressChanged(_collSurplusPoolAddress?: null): EventFilter;
    DefaultPoolAddressChanged(_defaultPoolAddress?: null): EventFilter;
    FrontEndRegistered(_frontend?: string | null, timestamp?: null): EventFilter;
    GasPoolAddressChanged(_gasPoolAddress?: null): EventFilter;
    GovernanceAddressChanged(_newGovernanceAddress?: null): EventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    PaidARTHBorrowingFeeToEcosystemFund(_ecosystemFund?: string | null, _ARTHFee?: null): EventFilter;
    PaidARTHBorrowingFeeToFrontEnd(_frontEndTag?: string | null, _ARTHFee?: null): EventFilter;
    SortedTrovesAddressChanged(_sortedTrovesAddress?: null): EventFilter;
    StabilityPoolAddressChanged(_stabilityPoolAddress?: null): EventFilter;
    TroveCreated(_borrower?: string | null, arrayIndex?: null): EventFilter;
    TroveManagerAddressChanged(_newTroveManagerAddress?: null): EventFilter;
    TroveUpdated(_borrower?: string | null, _debt?: null, _coll?: null, stake?: null, operation?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "ARTHBorrowingFeePaid"): _TypedLogDescription<{ _borrower: string; _ARTHFee: BigNumber }>[];
  extractEvents(logs: Log[], name: "ARTHTokenAddressChanged"): _TypedLogDescription<{ _arthTokenAddress: string }>[];
  extractEvents(logs: Log[], name: "ActivePoolAddressChanged"): _TypedLogDescription<{ _activePoolAddress: string }>[];
  extractEvents(logs: Log[], name: "CollSurplusPoolAddressChanged"): _TypedLogDescription<{ _collSurplusPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "DefaultPoolAddressChanged"): _TypedLogDescription<{ _defaultPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "FrontEndRegistered"): _TypedLogDescription<{ _frontend: string; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "GasPoolAddressChanged"): _TypedLogDescription<{ _gasPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "GovernanceAddressChanged"): _TypedLogDescription<{ _newGovernanceAddress: string }>[];
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "PaidARTHBorrowingFeeToEcosystemFund"): _TypedLogDescription<{ _ecosystemFund: string; _ARTHFee: BigNumber }>[];
  extractEvents(logs: Log[], name: "PaidARTHBorrowingFeeToFrontEnd"): _TypedLogDescription<{ _frontEndTag: string; _ARTHFee: BigNumber }>[];
  extractEvents(logs: Log[], name: "SortedTrovesAddressChanged"): _TypedLogDescription<{ _sortedTrovesAddress: string }>[];
  extractEvents(logs: Log[], name: "StabilityPoolAddressChanged"): _TypedLogDescription<{ _stabilityPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "TroveCreated"): _TypedLogDescription<{ _borrower: string; arrayIndex: BigNumber }>[];
  extractEvents(logs: Log[], name: "TroveManagerAddressChanged"): _TypedLogDescription<{ _newTroveManagerAddress: string }>[];
  extractEvents(logs: Log[], name: "TroveUpdated"): _TypedLogDescription<{ _borrower: string; _debt: BigNumber; _coll: BigNumber; stake: BigNumber; operation: number }>[];
}

interface CollSurplusPoolCalls {
  NAME(_overrides?: CallOverrides): Promise<string>;
  activePoolAddress(_overrides?: CallOverrides): Promise<string>;
  borrowerOperationsAddress(_overrides?: CallOverrides): Promise<string>;
  getCollateral(_account: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getETH(_overrides?: CallOverrides): Promise<BigNumber>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  owner(_overrides?: CallOverrides): Promise<string>;
  troveManagerAddress(_overrides?: CallOverrides): Promise<string>;
}

interface CollSurplusPoolTransactions {
  accountSurplus(_account: string, _amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  claimColl(_account: string, _overrides?: Overrides): Promise<void>;
  setAddresses(_borrowerOperationsAddress: string, _troveManagerAddress: string, _activePoolAddress: string, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
}

export interface CollSurplusPool
  extends _TypedARTHContract<CollSurplusPoolCalls, CollSurplusPoolTransactions> {
  readonly filters: {
    ActivePoolAddressChanged(_newActivePoolAddress?: null): EventFilter;
    BorrowerOperationsAddressChanged(_newBorrowerOperationsAddress?: null): EventFilter;
    CollBalanceUpdated(_account?: string | null, _newBalance?: null): EventFilter;
    EtherSent(_to?: null, _amount?: null): EventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    TroveManagerAddressChanged(_newTroveManagerAddress?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "ActivePoolAddressChanged"): _TypedLogDescription<{ _newActivePoolAddress: string }>[];
  extractEvents(logs: Log[], name: "BorrowerOperationsAddressChanged"): _TypedLogDescription<{ _newBorrowerOperationsAddress: string }>[];
  extractEvents(logs: Log[], name: "CollBalanceUpdated"): _TypedLogDescription<{ _account: string; _newBalance: BigNumber }>[];
  extractEvents(logs: Log[], name: "EtherSent"): _TypedLogDescription<{ _to: string; _amount: BigNumber }>[];
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "TroveManagerAddressChanged"): _TypedLogDescription<{ _newTroveManagerAddress: string }>[];
}

interface CommunityIssuanceCalls {
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  NAME(_overrides?: CallOverrides): Promise<string>;
  deploymentTime(_overrides?: CallOverrides): Promise<BigNumber>;
  governance(_overrides?: CallOverrides): Promise<string>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  lastTimeRewardApplicable(_overrides?: CallOverrides): Promise<BigNumber>;
  lastUpdateTime(_overrides?: CallOverrides): Promise<BigNumber>;
  owner(_overrides?: CallOverrides): Promise<string>;
  periodFinish(_overrides?: CallOverrides): Promise<BigNumber>;
  rewardRate(_overrides?: CallOverrides): Promise<BigNumber>;
  rewardsDuration(_overrides?: CallOverrides): Promise<BigNumber>;
  stabilityPoolAddress(_overrides?: CallOverrides): Promise<string>;
  totalMAHAIssued(_overrides?: CallOverrides): Promise<BigNumber>;
}

interface CommunityIssuanceTransactions {
  issueMAHA(_overrides?: Overrides): Promise<BigNumber>;
  notifyRewardAmount(reward: BigNumberish, _overrides?: Overrides): Promise<void>;
  sendMAHA(_account: string, _MAHAamount: BigNumberish, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
}

export interface CommunityIssuance
  extends _TypedARTHContract<CommunityIssuanceCalls, CommunityIssuanceTransactions> {
  readonly filters: {
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    RewardAdded(reward?: null): EventFilter;
    TotalMAHAIssuedUpdated(_totalMAHAIssued?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "RewardAdded"): _TypedLogDescription<{ reward: BigNumber }>[];
  extractEvents(logs: Log[], name: "TotalMAHAIssuedUpdated"): _TypedLogDescription<{ _totalMAHAIssued: BigNumber }>[];
}

interface DefaultPoolCalls {
  NAME(_overrides?: CallOverrides): Promise<string>;
  activePoolAddress(_overrides?: CallOverrides): Promise<string>;
  getARTHDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  getETH(_overrides?: CallOverrides): Promise<BigNumber>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  owner(_overrides?: CallOverrides): Promise<string>;
  troveManagerAddress(_overrides?: CallOverrides): Promise<string>;
}

interface DefaultPoolTransactions {
  decreaseARTHDebt(_amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  increaseARTHDebt(_amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  sendETHToActivePool(_amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  setAddresses(_troveManagerAddress: string, _activePoolAddress: string, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
}

export interface DefaultPool
  extends _TypedARTHContract<DefaultPoolCalls, DefaultPoolTransactions> {
  readonly filters: {
    ARTHBalanceUpdated(_newBalance?: null): EventFilter;
    ActivePoolAddressChanged(_newActivePoolAddress?: null): EventFilter;
    DefaultPoolARTHDebtUpdated(_ARTHDebt?: null): EventFilter;
    DefaultPoolAddressChanged(_newDefaultPoolAddress?: null): EventFilter;
    DefaultPoolETHBalanceUpdated(_ETH?: null): EventFilter;
    ETHBalanceUpdated(_newBalance?: null): EventFilter;
    EtherSent(_to?: null, _amount?: null): EventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    StabilityPoolAddressChanged(_newStabilityPoolAddress?: null): EventFilter;
    TroveManagerAddressChanged(_newTroveManagerAddress?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "ARTHBalanceUpdated"): _TypedLogDescription<{ _newBalance: BigNumber }>[];
  extractEvents(logs: Log[], name: "ActivePoolAddressChanged"): _TypedLogDescription<{ _newActivePoolAddress: string }>[];
  extractEvents(logs: Log[], name: "DefaultPoolARTHDebtUpdated"): _TypedLogDescription<{ _ARTHDebt: BigNumber }>[];
  extractEvents(logs: Log[], name: "DefaultPoolAddressChanged"): _TypedLogDescription<{ _newDefaultPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "DefaultPoolETHBalanceUpdated"): _TypedLogDescription<{ _ETH: BigNumber }>[];
  extractEvents(logs: Log[], name: "ETHBalanceUpdated"): _TypedLogDescription<{ _newBalance: BigNumber }>[];
  extractEvents(logs: Log[], name: "EtherSent"): _TypedLogDescription<{ _to: string; _amount: BigNumber }>[];
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "StabilityPoolAddressChanged"): _TypedLogDescription<{ _newStabilityPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "TroveManagerAddressChanged"): _TypedLogDescription<{ _newTroveManagerAddress: string }>[];
}

interface MockERC20Calls {
  allowance(owner: string, spender: string, _overrides?: CallOverrides): Promise<BigNumber>;
  balanceOf(account: string, _overrides?: CallOverrides): Promise<BigNumber>;
  decimals(_overrides?: CallOverrides): Promise<number>;
  name(_overrides?: CallOverrides): Promise<string>;
  symbol(_overrides?: CallOverrides): Promise<string>;
  totalSupply(_overrides?: CallOverrides): Promise<BigNumber>;
}

interface MockERC20Transactions {
  approve(spender: string, amount: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  burn(amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  burnFrom(account: string, amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  decreaseAllowance(spender: string, subtractedValue: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  increaseAllowance(spender: string, addedValue: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  mint(account: string, amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  transfer(to: string, amount: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  transferFrom(from: string, to: string, amount: BigNumberish, _overrides?: Overrides): Promise<boolean>;
}

export interface MockERC20
  extends _TypedARTHContract<MockERC20Calls, MockERC20Transactions> {
  readonly filters: {
    Approval(owner?: string | null, spender?: string | null, value?: null): EventFilter;
    Transfer(from?: string | null, to?: string | null, value?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "Approval"): _TypedLogDescription<{ owner: string; spender: string; value: BigNumber }>[];
  extractEvents(logs: Log[], name: "Transfer"): _TypedLogDescription<{ from: string; to: string; value: BigNumber }>[];
}

interface GasPoolCalls {
}

interface GasPoolTransactions {
}

export interface GasPool
  extends _TypedARTHContract<GasPoolCalls, GasPoolTransactions> {
  readonly filters: {
  };
}

interface HintHelpersCalls {
  ARTH_GAS_COMPENSATION(_overrides?: CallOverrides): Promise<BigNumber>;
  CCR(_overrides?: CallOverrides): Promise<BigNumber>;
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  MCR(_overrides?: CallOverrides): Promise<BigNumber>;
  MIN_NET_DEBT(_overrides?: CallOverrides): Promise<BigNumber>;
  NAME(_overrides?: CallOverrides): Promise<string>;
  PERCENT_DIVISOR(_overrides?: CallOverrides): Promise<BigNumber>;
  _100pct(_overrides?: CallOverrides): Promise<BigNumber>;
  activePool(_overrides?: CallOverrides): Promise<string>;
  computeCR(_coll: BigNumberish, _debt: BigNumberish, _price: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  computeNominalCR(_coll: BigNumberish, _debt: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  defaultPool(_overrides?: CallOverrides): Promise<string>;
  getApproxHint(_CR: BigNumberish, _numTrials: BigNumberish, _inputRandomSeed: BigNumberish, _overrides?: CallOverrides): Promise<{ hintAddress: string; diff: BigNumber; latestRandomSeed: BigNumber }>;
  getBorrowingFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  getEntireSystemColl(_overrides?: CallOverrides): Promise<BigNumber>;
  getEntireSystemDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  getMaxBorrowingFee(_overrides?: CallOverrides): Promise<BigNumber>;
  getPriceFeed(_overrides?: CallOverrides): Promise<string>;
  getRedemptionFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  getRedemptionHints(_ARTHamount: BigNumberish, _price: BigNumberish, _maxIterations: BigNumberish, _overrides?: CallOverrides): Promise<{ firstRedemptionHint: string; partialRedemptionHintNICR: BigNumber; truncatedARTHamount: BigNumber }>;
  governance(_overrides?: CallOverrides): Promise<string>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  owner(_overrides?: CallOverrides): Promise<string>;
  sortedTroves(_overrides?: CallOverrides): Promise<string>;
  troveManager(_overrides?: CallOverrides): Promise<string>;
}

interface HintHelpersTransactions {
  fetchPriceFeedPrice(_overrides?: Overrides): Promise<BigNumber>;
  setAddresses(_sortedTrovesAddress: string, _troveManagerAddress: string, _governance: string, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
}

export interface HintHelpers
  extends _TypedARTHContract<HintHelpersCalls, HintHelpersTransactions> {
  readonly filters: {
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    SortedTrovesAddressChanged(_sortedTrovesAddress?: null): EventFilter;
    TroveManagerAddressChanged(_troveManagerAddress?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "SortedTrovesAddressChanged"): _TypedLogDescription<{ _sortedTrovesAddress: string }>[];
  extractEvents(logs: Log[], name: "TroveManagerAddressChanged"): _TypedLogDescription<{ _troveManagerAddress: string }>[];
}

interface IERC20Calls {
  allowance(owner: string, spender: string, _overrides?: CallOverrides): Promise<BigNumber>;
  balanceOf(account: string, _overrides?: CallOverrides): Promise<BigNumber>;
  totalSupply(_overrides?: CallOverrides): Promise<BigNumber>;
}

interface IERC20Transactions {
  approve(spender: string, amount: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  transfer(to: string, amount: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  transferFrom(from: string, to: string, amount: BigNumberish, _overrides?: Overrides): Promise<boolean>;
}

export interface IERC20
  extends _TypedARTHContract<IERC20Calls, IERC20Transactions> {
  readonly filters: {
    Approval(owner?: string | null, spender?: string | null, value?: null): EventFilter;
    Transfer(from?: string | null, to?: string | null, value?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "Approval"): _TypedLogDescription<{ owner: string; spender: string; value: BigNumber }>[];
  extractEvents(logs: Log[], name: "Transfer"): _TypedLogDescription<{ from: string; to: string; value: BigNumber }>[];
}

interface ARTHValuecoinCalls {
  allowance(owner: string, spender: string, _overrides?: CallOverrides): Promise<BigNumber>;
  balanceOf(account: string, _overrides?: CallOverrides): Promise<BigNumber>;
  borrowerOperationAddresses(arg0: string, _overrides?: CallOverrides): Promise<boolean>;
  decimals(_overrides?: CallOverrides): Promise<number>;
  domainSeparator(_overrides?: CallOverrides): Promise<string>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  name(_overrides?: CallOverrides): Promise<string>;
  nonces(owner: string, _overrides?: CallOverrides): Promise<BigNumber>;
  owner(_overrides?: CallOverrides): Promise<string>;
  permitTypeHash(_overrides?: CallOverrides): Promise<string>;
  stabilityPoolAddresses(arg0: string, _overrides?: CallOverrides): Promise<boolean>;
  symbol(_overrides?: CallOverrides): Promise<string>;
  totalSupply(_overrides?: CallOverrides): Promise<BigNumber>;
  troveManagerAddresses(arg0: string, _overrides?: CallOverrides): Promise<boolean>;
  version(_overrides?: CallOverrides): Promise<string>;
}

interface ARTHValuecoinTransactions {
  approve(spender: string, amount: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  burn(_account: string, _amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  decreaseAllowance(spender: string, subtractedValue: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  increaseAllowance(spender: string, addedValue: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  mint(_account: string, _amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  permit(owner: string, spender: string, amount: BigNumberish, deadline: BigNumberish, v: BigNumberish, r: BytesLike, s: BytesLike, _overrides?: Overrides): Promise<void>;
  returnFromPool(_poolAddress: string, _receiver: string, _amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  sendToPool(_sender: string, _poolAddress: string, _amount: BigNumberish, _overrides?: Overrides): Promise<void>;
  toggleBorrowerOperations(borrowerOperations: string, _overrides?: Overrides): Promise<void>;
  toggleStabilityPool(stabilityPool: string, _overrides?: Overrides): Promise<void>;
  toggleTroveManager(troveManager: string, _overrides?: Overrides): Promise<void>;
  transfer(recipient: string, amount: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  transferFrom(sender: string, recipient: string, amount: BigNumberish, _overrides?: Overrides): Promise<boolean>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
}

export interface ARTHValuecoin
  extends _TypedARTHContract<ARTHValuecoinCalls, ARTHValuecoinTransactions> {
  readonly filters: {
    ARTHTokenBalanceUpdated(_user?: null, _amount?: null): EventFilter;
    Approval(owner?: string | null, spender?: string | null, value?: null): EventFilter;
    BorrowerOperationsAddressChanged(_newBorrowerOperationsAddress?: null): EventFilter;
    BorrowerOperationsAddressToggled(borrowerOperations?: null, oldFlag?: null, newFlag?: null, timestamp?: null): EventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    StabilityPoolAddressChanged(_newStabilityPoolAddress?: null): EventFilter;
    StabilityPoolToggled(stabilityPool?: null, oldFlag?: null, newFlag?: null, timestamp?: null): EventFilter;
    Transfer(from?: string | null, to?: string | null, value?: null): EventFilter;
    TroveManagerAddressChanged(_troveManagerAddress?: null): EventFilter;
    TroveManagerToggled(troveManager?: null, oldFlag?: null, newFlag?: null, timestamp?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "ARTHTokenBalanceUpdated"): _TypedLogDescription<{ _user: string; _amount: BigNumber }>[];
  extractEvents(logs: Log[], name: "Approval"): _TypedLogDescription<{ owner: string; spender: string; value: BigNumber }>[];
  extractEvents(logs: Log[], name: "BorrowerOperationsAddressChanged"): _TypedLogDescription<{ _newBorrowerOperationsAddress: string }>[];
  extractEvents(logs: Log[], name: "BorrowerOperationsAddressToggled"): _TypedLogDescription<{ borrowerOperations: string; oldFlag: boolean; newFlag: boolean; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "StabilityPoolAddressChanged"): _TypedLogDescription<{ _newStabilityPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "StabilityPoolToggled"): _TypedLogDescription<{ stabilityPool: string; oldFlag: boolean; newFlag: boolean; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "Transfer"): _TypedLogDescription<{ from: string; to: string; value: BigNumber }>[];
  extractEvents(logs: Log[], name: "TroveManagerAddressChanged"): _TypedLogDescription<{ _troveManagerAddress: string }>[];
  extractEvents(logs: Log[], name: "TroveManagerToggled"): _TypedLogDescription<{ troveManager: string; oldFlag: boolean; newFlag: boolean; timestamp: BigNumber }>[];
}

interface MultiTroveGetterCalls {
  getMultipleSortedTroves(_startIdx: BigNumberish, _count: BigNumberish, _overrides?: CallOverrides): Promise<{ owner: string; debt: BigNumber; coll: BigNumber; stake: BigNumber; snapshotETH: BigNumber; snapshotARTHDebt: BigNumber }[]>;
  sortedTroves(_overrides?: CallOverrides): Promise<string>;
  troveManager(_overrides?: CallOverrides): Promise<string>;
}

interface MultiTroveGetterTransactions {
}

export interface MultiTroveGetter
  extends _TypedARTHContract<MultiTroveGetterCalls, MultiTroveGetterTransactions> {
  readonly filters: {
  };
}

interface PriceFeedCalls {
  NAME(_overrides?: CallOverrides): Promise<string>;
  ethUSDpricefeed(_overrides?: CallOverrides): Promise<string>;
  gmuOracle(_overrides?: CallOverrides): Promise<string>;
  lastGoodPrice(_overrides?: CallOverrides): Promise<BigNumber>;
}

interface PriceFeedTransactions {
  fetchPrice(_overrides?: Overrides): Promise<BigNumber>;
}

export interface PriceFeed
  extends _TypedARTHContract<PriceFeedCalls, PriceFeedTransactions> {
  readonly filters: {
    LastGoodPriceUpdated(_lastGoodPrice?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "LastGoodPriceUpdated"): _TypedLogDescription<{ _lastGoodPrice: BigNumber }>[];
}

interface PriceFeedTestnetCalls {
  getPrice(_overrides?: CallOverrides): Promise<BigNumber>;
}

interface PriceFeedTestnetTransactions {
  fetchPrice(_overrides?: Overrides): Promise<BigNumber>;
  setPrice(price: BigNumberish, _overrides?: Overrides): Promise<boolean>;
}

export interface PriceFeedTestnet
  extends _TypedARTHContract<PriceFeedTestnetCalls, PriceFeedTestnetTransactions> {
  readonly filters: {
    LastGoodPriceUpdated(_lastGoodPrice?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "LastGoodPriceUpdated"): _TypedLogDescription<{ _lastGoodPrice: BigNumber }>[];
}

interface SortedTrovesCalls {
  NAME(_overrides?: CallOverrides): Promise<string>;
  borrowerOperationsAddress(_overrides?: CallOverrides): Promise<string>;
  contains(_id: string, _overrides?: CallOverrides): Promise<boolean>;
  data(_overrides?: CallOverrides): Promise<{ head: string; tail: string; maxSize: BigNumber; size: BigNumber }>;
  findInsertPosition(_NICR: BigNumberish, _prevId: string, _nextId: string, _overrides?: CallOverrides): Promise<[string, string]>;
  getFirst(_overrides?: CallOverrides): Promise<string>;
  getLast(_overrides?: CallOverrides): Promise<string>;
  getMaxSize(_overrides?: CallOverrides): Promise<BigNumber>;
  getNext(_id: string, _overrides?: CallOverrides): Promise<string>;
  getPrev(_id: string, _overrides?: CallOverrides): Promise<string>;
  getSize(_overrides?: CallOverrides): Promise<BigNumber>;
  isEmpty(_overrides?: CallOverrides): Promise<boolean>;
  isFull(_overrides?: CallOverrides): Promise<boolean>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  owner(_overrides?: CallOverrides): Promise<string>;
  troveManager(_overrides?: CallOverrides): Promise<string>;
  validInsertPosition(_NICR: BigNumberish, _prevId: string, _nextId: string, _overrides?: CallOverrides): Promise<boolean>;
}

interface SortedTrovesTransactions {
  insert(_id: string, _NICR: BigNumberish, _prevId: string, _nextId: string, _overrides?: Overrides): Promise<void>;
  reInsert(_id: string, _newNICR: BigNumberish, _prevId: string, _nextId: string, _overrides?: Overrides): Promise<void>;
  remove(_id: string, _overrides?: Overrides): Promise<void>;
  setParams(_size: BigNumberish, _troveManagerAddress: string, _borrowerOperationsAddress: string, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
}

export interface SortedTroves
  extends _TypedARTHContract<SortedTrovesCalls, SortedTrovesTransactions> {
  readonly filters: {
    BorrowerOperationsAddressChanged(_borrowerOperationsAddress?: null): EventFilter;
    NodeAdded(_id?: null, _NICR?: null): EventFilter;
    NodeRemoved(_id?: null): EventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    SortedTrovesAddressChanged(_sortedDoublyLLAddress?: null): EventFilter;
    TroveManagerAddressChanged(_troveManagerAddress?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "BorrowerOperationsAddressChanged"): _TypedLogDescription<{ _borrowerOperationsAddress: string }>[];
  extractEvents(logs: Log[], name: "NodeAdded"): _TypedLogDescription<{ _id: string; _NICR: BigNumber }>[];
  extractEvents(logs: Log[], name: "NodeRemoved"): _TypedLogDescription<{ _id: string }>[];
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "SortedTrovesAddressChanged"): _TypedLogDescription<{ _sortedDoublyLLAddress: string }>[];
  extractEvents(logs: Log[], name: "TroveManagerAddressChanged"): _TypedLogDescription<{ _troveManagerAddress: string }>[];
}

interface StabilityPoolCalls {
  ARTH_GAS_COMPENSATION(_overrides?: CallOverrides): Promise<BigNumber>;
  CCR(_overrides?: CallOverrides): Promise<BigNumber>;
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  MCR(_overrides?: CallOverrides): Promise<BigNumber>;
  MIN_NET_DEBT(_overrides?: CallOverrides): Promise<BigNumber>;
  NAME(_overrides?: CallOverrides): Promise<string>;
  P(_overrides?: CallOverrides): Promise<BigNumber>;
  PERCENT_DIVISOR(_overrides?: CallOverrides): Promise<BigNumber>;
  SCALE_FACTOR(_overrides?: CallOverrides): Promise<BigNumber>;
  _100pct(_overrides?: CallOverrides): Promise<BigNumber>;
  activePool(_overrides?: CallOverrides): Promise<string>;
  arthToken(_overrides?: CallOverrides): Promise<string>;
  borrowerOperations(_overrides?: CallOverrides): Promise<string>;
  communityIssuance(_overrides?: CallOverrides): Promise<string>;
  currentEpoch(_overrides?: CallOverrides): Promise<BigNumber>;
  currentScale(_overrides?: CallOverrides): Promise<BigNumber>;
  defaultPool(_overrides?: CallOverrides): Promise<string>;
  depositSnapshots(arg0: string, _overrides?: CallOverrides): Promise<{ S: BigNumber; P: BigNumber; G: BigNumber; scale: BigNumber; epoch: BigNumber }>;
  deposits(arg0: string, _overrides?: CallOverrides): Promise<{ initialValue: BigNumber; frontEndTag: string }>;
  epochToScaleToG(arg0: BigNumberish, arg1: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  epochToScaleToSum(arg0: BigNumberish, arg1: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  frontEndSnapshots(arg0: string, _overrides?: CallOverrides): Promise<{ S: BigNumber; P: BigNumber; G: BigNumber; scale: BigNumber; epoch: BigNumber }>;
  frontEndStakes(arg0: string, _overrides?: CallOverrides): Promise<BigNumber>;
  frontEnds(arg0: string, _overrides?: CallOverrides): Promise<{ kickbackRate: BigNumber; registered: boolean }>;
  getBorrowingFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  getCompoundedARTHDeposit(_depositor: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getCompoundedFrontEndStake(_frontEnd: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getDepositorETHGain(_depositor: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getDepositorMAHAGain(_depositor: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getETH(_overrides?: CallOverrides): Promise<BigNumber>;
  getEntireSystemColl(_overrides?: CallOverrides): Promise<BigNumber>;
  getEntireSystemDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  getFrontEndMAHAGain(_frontEnd: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getMaxBorrowingFee(_overrides?: CallOverrides): Promise<BigNumber>;
  getPriceFeed(_overrides?: CallOverrides): Promise<string>;
  getRedemptionFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  getTotalARTHDeposits(_overrides?: CallOverrides): Promise<BigNumber>;
  governance(_overrides?: CallOverrides): Promise<string>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  lastARTHLossError_Offset(_overrides?: CallOverrides): Promise<BigNumber>;
  lastETHError_Offset(_overrides?: CallOverrides): Promise<BigNumber>;
  lastMAHAError(_overrides?: CallOverrides): Promise<BigNumber>;
  owner(_overrides?: CallOverrides): Promise<string>;
  sortedTroves(_overrides?: CallOverrides): Promise<string>;
  troveManager(_overrides?: CallOverrides): Promise<string>;
}

interface StabilityPoolTransactions {
  fetchPriceFeedPrice(_overrides?: Overrides): Promise<BigNumber>;
  offset(_debtToOffset: BigNumberish, _collToAdd: BigNumberish, _overrides?: Overrides): Promise<void>;
  provideToSP(_amount: BigNumberish, _frontEndTag: string, _overrides?: Overrides): Promise<void>;
  provideToSPFor(_who: string, _amount: BigNumberish, _frontEndTag: string, _overrides?: Overrides): Promise<void>;
  registerFrontEnd(_kickbackRate: BigNumberish, _overrides?: Overrides): Promise<void>;
  setAddresses(_borrowerOperationsAddress: string, _troveManagerAddress: string, _activePoolAddress: string, _arthTokenAddress: string, _sortedTrovesAddress: string, _governanceAddress: string, _communityIssuanceAddress: string, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
  withdrawETHGainToTrove(_upperHint: string, _lowerHint: string, _overrides?: Overrides): Promise<void>;
  withdrawFromSP(_amount: BigNumberish, _overrides?: Overrides): Promise<void>;
}

export interface StabilityPool
  extends _TypedARTHContract<StabilityPoolCalls, StabilityPoolTransactions> {
  readonly filters: {
    ARTHTokenAddressChanged(_newARTHTokenAddress?: null): EventFilter;
    ActivePoolAddressChanged(_newActivePoolAddress?: null): EventFilter;
    BorrowerOperationsAddressChanged(_newBorrowerOperationsAddress?: null): EventFilter;
    CommunityIssuanceAddressChanged(_newCommunityIssuanceAddress?: null): EventFilter;
    DefaultPoolAddressChanged(_newDefaultPoolAddress?: null): EventFilter;
    DepositSnapshotUpdated(_depositor?: string | null, _P?: null, _S?: null, _G?: null): EventFilter;
    ETHGainWithdrawn(_depositor?: string | null, _ETH?: null, _ARTHLoss?: null): EventFilter;
    EpochUpdated(_currentEpoch?: null): EventFilter;
    EtherSent(_to?: null, _amount?: null): EventFilter;
    FrontEndRegistered(_frontEnd?: string | null, _kickbackRate?: null): EventFilter;
    FrontEndSnapshotUpdated(_frontEnd?: string | null, _P?: null, _G?: null): EventFilter;
    FrontEndStakeChanged(_frontEnd?: string | null, _newFrontEndStake?: null, _depositor?: null): EventFilter;
    FrontEndTagSet(_depositor?: string | null, _frontEnd?: string | null): EventFilter;
    G_Updated(_G?: null, _epoch?: null, _scale?: null): EventFilter;
    GovernanceAddressChanged(_newGovernanceAddress?: null): EventFilter;
    MAHAPaidToDepositor(_depositor?: string | null, _MAHA?: null): EventFilter;
    MAHAPaidToFrontEnd(_frontEnd?: string | null, _MAHA?: null): EventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    P_Updated(_P?: null): EventFilter;
    S_Updated(_S?: null, _epoch?: null, _scale?: null): EventFilter;
    ScaleUpdated(_currentScale?: null): EventFilter;
    SortedTrovesAddressChanged(_newSortedTrovesAddress?: null): EventFilter;
    StabilityPoolARTHBalanceUpdated(_newBalance?: null): EventFilter;
    StabilityPoolETHBalanceUpdated(_newBalance?: null): EventFilter;
    TroveManagerAddressChanged(_newTroveManagerAddress?: null): EventFilter;
    UserDepositChanged(_depositor?: string | null, _newDeposit?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "ARTHTokenAddressChanged"): _TypedLogDescription<{ _newARTHTokenAddress: string }>[];
  extractEvents(logs: Log[], name: "ActivePoolAddressChanged"): _TypedLogDescription<{ _newActivePoolAddress: string }>[];
  extractEvents(logs: Log[], name: "BorrowerOperationsAddressChanged"): _TypedLogDescription<{ _newBorrowerOperationsAddress: string }>[];
  extractEvents(logs: Log[], name: "CommunityIssuanceAddressChanged"): _TypedLogDescription<{ _newCommunityIssuanceAddress: string }>[];
  extractEvents(logs: Log[], name: "DefaultPoolAddressChanged"): _TypedLogDescription<{ _newDefaultPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "DepositSnapshotUpdated"): _TypedLogDescription<{ _depositor: string; _P: BigNumber; _S: BigNumber; _G: BigNumber }>[];
  extractEvents(logs: Log[], name: "ETHGainWithdrawn"): _TypedLogDescription<{ _depositor: string; _ETH: BigNumber; _ARTHLoss: BigNumber }>[];
  extractEvents(logs: Log[], name: "EpochUpdated"): _TypedLogDescription<{ _currentEpoch: BigNumber }>[];
  extractEvents(logs: Log[], name: "EtherSent"): _TypedLogDescription<{ _to: string; _amount: BigNumber }>[];
  extractEvents(logs: Log[], name: "FrontEndRegistered"): _TypedLogDescription<{ _frontEnd: string; _kickbackRate: BigNumber }>[];
  extractEvents(logs: Log[], name: "FrontEndSnapshotUpdated"): _TypedLogDescription<{ _frontEnd: string; _P: BigNumber; _G: BigNumber }>[];
  extractEvents(logs: Log[], name: "FrontEndStakeChanged"): _TypedLogDescription<{ _frontEnd: string; _newFrontEndStake: BigNumber; _depositor: string }>[];
  extractEvents(logs: Log[], name: "FrontEndTagSet"): _TypedLogDescription<{ _depositor: string; _frontEnd: string }>[];
  extractEvents(logs: Log[], name: "G_Updated"): _TypedLogDescription<{ _G: BigNumber; _epoch: BigNumber; _scale: BigNumber }>[];
  extractEvents(logs: Log[], name: "GovernanceAddressChanged"): _TypedLogDescription<{ _newGovernanceAddress: string }>[];
  extractEvents(logs: Log[], name: "MAHAPaidToDepositor"): _TypedLogDescription<{ _depositor: string; _MAHA: BigNumber }>[];
  extractEvents(logs: Log[], name: "MAHAPaidToFrontEnd"): _TypedLogDescription<{ _frontEnd: string; _MAHA: BigNumber }>[];
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "P_Updated"): _TypedLogDescription<{ _P: BigNumber }>[];
  extractEvents(logs: Log[], name: "S_Updated"): _TypedLogDescription<{ _S: BigNumber; _epoch: BigNumber; _scale: BigNumber }>[];
  extractEvents(logs: Log[], name: "ScaleUpdated"): _TypedLogDescription<{ _currentScale: BigNumber }>[];
  extractEvents(logs: Log[], name: "SortedTrovesAddressChanged"): _TypedLogDescription<{ _newSortedTrovesAddress: string }>[];
  extractEvents(logs: Log[], name: "StabilityPoolARTHBalanceUpdated"): _TypedLogDescription<{ _newBalance: BigNumber }>[];
  extractEvents(logs: Log[], name: "StabilityPoolETHBalanceUpdated"): _TypedLogDescription<{ _newBalance: BigNumber }>[];
  extractEvents(logs: Log[], name: "TroveManagerAddressChanged"): _TypedLogDescription<{ _newTroveManagerAddress: string }>[];
  extractEvents(logs: Log[], name: "UserDepositChanged"): _TypedLogDescription<{ _depositor: string; _newDeposit: BigNumber }>[];
}

interface TroveManagerCalls {
  ARTH_GAS_COMPENSATION(_overrides?: CallOverrides): Promise<BigNumber>;
  BETA(_overrides?: CallOverrides): Promise<BigNumber>;
  BOOTSTRAP_PERIOD(_overrides?: CallOverrides): Promise<BigNumber>;
  CCR(_overrides?: CallOverrides): Promise<BigNumber>;
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  L_ARTHDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  L_ETH(_overrides?: CallOverrides): Promise<BigNumber>;
  MCR(_overrides?: CallOverrides): Promise<BigNumber>;
  MINUTE_DECAY_FACTOR(_overrides?: CallOverrides): Promise<BigNumber>;
  MIN_NET_DEBT(_overrides?: CallOverrides): Promise<BigNumber>;
  NAME(_overrides?: CallOverrides): Promise<string>;
  PERCENT_DIVISOR(_overrides?: CallOverrides): Promise<BigNumber>;
  SECONDS_IN_ONE_MINUTE(_overrides?: CallOverrides): Promise<BigNumber>;
  TroveOwners(arg0: BigNumberish, _overrides?: CallOverrides): Promise<string>;
  Troves(arg0: string, _overrides?: CallOverrides): Promise<{ debt: BigNumber; coll: BigNumber; stake: BigNumber; status: number; arrayIndex: BigNumber; frontEndTag: string }>;
  _100pct(_overrides?: CallOverrides): Promise<BigNumber>;
  activePool(_overrides?: CallOverrides): Promise<string>;
  arthToken(_overrides?: CallOverrides): Promise<string>;
  baseRate(_overrides?: CallOverrides): Promise<BigNumber>;
  borrowerOperationsAddress(_overrides?: CallOverrides): Promise<string>;
  checkRecoveryMode(_price: BigNumberish, _overrides?: CallOverrides): Promise<boolean>;
  defaultPool(_overrides?: CallOverrides): Promise<string>;
  getBorrowingFee(_ARTHDebt: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  getBorrowingFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  getBorrowingFeeWithDecay(_ARTHDebt: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  getBorrowingRate(_overrides?: CallOverrides): Promise<BigNumber>;
  getBorrowingRateWithDecay(_overrides?: CallOverrides): Promise<BigNumber>;
  getCurrentICR(_borrower: string, _price: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  getEntireDebtAndColl(_borrower: string, _overrides?: CallOverrides): Promise<{ debt: BigNumber; coll: BigNumber; pendingARTHDebtReward: BigNumber; pendingETHReward: BigNumber }>;
  getEntireSystemColl(_overrides?: CallOverrides): Promise<BigNumber>;
  getEntireSystemDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  getMaxBorrowingFee(_overrides?: CallOverrides): Promise<BigNumber>;
  getNominalICR(_borrower: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getPendingARTHDebtReward(_borrower: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getPendingETHReward(_borrower: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getPriceFeed(_overrides?: CallOverrides): Promise<string>;
  getRedemptionFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  getRedemptionFeeWithDecay(_ETHDrawn: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  getRedemptionRate(_overrides?: CallOverrides): Promise<BigNumber>;
  getRedemptionRateWithDecay(_overrides?: CallOverrides): Promise<BigNumber>;
  getTCR(_price: BigNumberish, _overrides?: CallOverrides): Promise<BigNumber>;
  getTroveColl(_borrower: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getTroveDebt(_borrower: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getTroveFromTroveOwnersArray(_index: BigNumberish, _overrides?: CallOverrides): Promise<string>;
  getTroveFrontEnd(_borrower: string, _overrides?: CallOverrides): Promise<string>;
  getTroveOwnersCount(_overrides?: CallOverrides): Promise<BigNumber>;
  getTroveStake(_borrower: string, _overrides?: CallOverrides): Promise<BigNumber>;
  getTroveStatus(_borrower: string, _overrides?: CallOverrides): Promise<BigNumber>;
  governance(_overrides?: CallOverrides): Promise<string>;
  hasPendingRewards(_borrower: string, _overrides?: CallOverrides): Promise<boolean>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  lastARTHDebtError_Redistribution(_overrides?: CallOverrides): Promise<BigNumber>;
  lastETHError_Redistribution(_overrides?: CallOverrides): Promise<BigNumber>;
  lastFeeOperationTime(_overrides?: CallOverrides): Promise<BigNumber>;
  owner(_overrides?: CallOverrides): Promise<string>;
  rewardSnapshots(arg0: string, _overrides?: CallOverrides): Promise<{ ETH: BigNumber; ARTHDebt: BigNumber }>;
  sortedTroves(_overrides?: CallOverrides): Promise<string>;
  stabilityPool(_overrides?: CallOverrides): Promise<string>;
  totalCollateralSnapshot(_overrides?: CallOverrides): Promise<BigNumber>;
  totalStakes(_overrides?: CallOverrides): Promise<BigNumber>;
  totalStakesSnapshot(_overrides?: CallOverrides): Promise<BigNumber>;
}

interface TroveManagerTransactions {
  addTroveOwnerToArray(_borrower: string, _overrides?: Overrides): Promise<BigNumber>;
  applyPendingRewards(_borrower: string, _overrides?: Overrides): Promise<void>;
  batchLiquidateTroves(_troveArray: string[], _overrides?: Overrides): Promise<void>;
  closeTrove(_borrower: string, _overrides?: Overrides): Promise<void>;
  decayBaseRateFromBorrowing(_overrides?: Overrides): Promise<void>;
  decreaseTroveColl(_borrower: string, _collDecrease: BigNumberish, _overrides?: Overrides): Promise<BigNumber>;
  decreaseTroveDebt(_borrower: string, _debtDecrease: BigNumberish, _overrides?: Overrides): Promise<BigNumber>;
  fetchPriceFeedPrice(_overrides?: Overrides): Promise<BigNumber>;
  increaseTroveColl(_borrower: string, _collIncrease: BigNumberish, _overrides?: Overrides): Promise<BigNumber>;
  increaseTroveDebt(_borrower: string, _debtIncrease: BigNumberish, _overrides?: Overrides): Promise<BigNumber>;
  liquidate(_borrower: string, _overrides?: Overrides): Promise<void>;
  liquidateTroves(_n: BigNumberish, _overrides?: Overrides): Promise<void>;
  redeemCollateral(_ARTHamount: BigNumberish, _firstRedemptionHint: string, _upperPartialRedemptionHint: string, _lowerPartialRedemptionHint: string, _partialRedemptionHintNICR: BigNumberish, _maxIterations: BigNumberish, _maxFeePercentage: BigNumberish, _overrides?: Overrides): Promise<void>;
  removeStake(_borrower: string, _overrides?: Overrides): Promise<void>;
  setAddresses(_borrowerOperationsAddress: string, _activePoolAddress: string, _defaultPoolAddress: string, _stabilityPoolAddress: string, _gasPoolAddress: string, _collSurplusPoolAddress: string, _governanceAddress: string, _arthTokenAddress: string, _sortedTrovesAddress: string, _overrides?: Overrides): Promise<void>;
  setTroveFrontEndTag(_borrower: string, _frontEndTag: string, _overrides?: Overrides): Promise<void>;
  setTroveStatus(_borrower: string, _num: BigNumberish, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
  updateStakeAndTotalStakes(_borrower: string, _overrides?: Overrides): Promise<BigNumber>;
  updateTroveRewardSnapshots(_borrower: string, _overrides?: Overrides): Promise<void>;
}

export interface TroveManager
  extends _TypedARTHContract<TroveManagerCalls, TroveManagerTransactions> {
  readonly filters: {
    ARTHTokenAddressChanged(_newARTHTokenAddress?: null): EventFilter;
    ActivePoolAddressChanged(_activePoolAddress?: null): EventFilter;
    BaseRateUpdated(_baseRate?: null): EventFilter;
    BorrowerOperationsAddressChanged(_newBorrowerOperationsAddress?: null): EventFilter;
    CollSurplusPoolAddressChanged(_collSurplusPoolAddress?: null): EventFilter;
    DefaultPoolAddressChanged(_defaultPoolAddress?: null): EventFilter;
    GasPoolAddressChanged(_gasPoolAddress?: null): EventFilter;
    GovernanceAddressChanged(_governanceAddress?: null): EventFilter;
    LTermsUpdated(_L_ETH?: null, _L_ARTHDebt?: null): EventFilter;
    LastFeeOpTimeUpdated(_lastFeeOpTime?: null): EventFilter;
    Liquidation(_liquidatedDebt?: null, _liquidatedColl?: null, _collGasCompensation?: null, _ARTHGasCompensation?: null): EventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    Redemption(_attemptedARTHAmount?: null, _actualARTHAmount?: null, _ETHSent?: null, _ETHFee?: null): EventFilter;
    RewardSnapshotDetailsUpdated(owner?: null, newOwner?: null, timestamp?: null): EventFilter;
    SortedTrovesAddressChanged(_sortedTrovesAddress?: null): EventFilter;
    StabilityPoolAddressChanged(_stabilityPoolAddress?: null): EventFilter;
    SystemSnapshotsUpdated(_totalStakesSnapshot?: null, _totalCollateralSnapshot?: null): EventFilter;
    TotalStakesUpdated(_newTotalStakes?: null): EventFilter;
    TroveIndexUpdated(_borrower?: null, _newIndex?: null): EventFilter;
    TroveLiquidated(_borrower?: string | null, _debt?: null, _coll?: null, _operation?: null): EventFilter;
    TroveOwnersUpdated(owner?: null, newOwner?: null, idx?: null, timestamp?: null): EventFilter;
    TroveSnapshotsUpdated(_L_ETH?: null, _L_ARTHDebt?: null): EventFilter;
    TroveUpdated(_borrower?: string | null, _debt?: null, _coll?: null, _stake?: null, _operation?: null): EventFilter;
    WETHAddressChanged(_wethAddress?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "ARTHTokenAddressChanged"): _TypedLogDescription<{ _newARTHTokenAddress: string }>[];
  extractEvents(logs: Log[], name: "ActivePoolAddressChanged"): _TypedLogDescription<{ _activePoolAddress: string }>[];
  extractEvents(logs: Log[], name: "BaseRateUpdated"): _TypedLogDescription<{ _baseRate: BigNumber }>[];
  extractEvents(logs: Log[], name: "BorrowerOperationsAddressChanged"): _TypedLogDescription<{ _newBorrowerOperationsAddress: string }>[];
  extractEvents(logs: Log[], name: "CollSurplusPoolAddressChanged"): _TypedLogDescription<{ _collSurplusPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "DefaultPoolAddressChanged"): _TypedLogDescription<{ _defaultPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "GasPoolAddressChanged"): _TypedLogDescription<{ _gasPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "GovernanceAddressChanged"): _TypedLogDescription<{ _governanceAddress: string }>[];
  extractEvents(logs: Log[], name: "LTermsUpdated"): _TypedLogDescription<{ _L_ETH: BigNumber; _L_ARTHDebt: BigNumber }>[];
  extractEvents(logs: Log[], name: "LastFeeOpTimeUpdated"): _TypedLogDescription<{ _lastFeeOpTime: BigNumber }>[];
  extractEvents(logs: Log[], name: "Liquidation"): _TypedLogDescription<{ _liquidatedDebt: BigNumber; _liquidatedColl: BigNumber; _collGasCompensation: BigNumber; _ARTHGasCompensation: BigNumber }>[];
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "Redemption"): _TypedLogDescription<{ _attemptedARTHAmount: BigNumber; _actualARTHAmount: BigNumber; _ETHSent: BigNumber; _ETHFee: BigNumber }>[];
  extractEvents(logs: Log[], name: "RewardSnapshotDetailsUpdated"): _TypedLogDescription<{ owner: string; newOwner: string; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "SortedTrovesAddressChanged"): _TypedLogDescription<{ _sortedTrovesAddress: string }>[];
  extractEvents(logs: Log[], name: "StabilityPoolAddressChanged"): _TypedLogDescription<{ _stabilityPoolAddress: string }>[];
  extractEvents(logs: Log[], name: "SystemSnapshotsUpdated"): _TypedLogDescription<{ _totalStakesSnapshot: BigNumber; _totalCollateralSnapshot: BigNumber }>[];
  extractEvents(logs: Log[], name: "TotalStakesUpdated"): _TypedLogDescription<{ _newTotalStakes: BigNumber }>[];
  extractEvents(logs: Log[], name: "TroveIndexUpdated"): _TypedLogDescription<{ _borrower: string; _newIndex: BigNumber }>[];
  extractEvents(logs: Log[], name: "TroveLiquidated"): _TypedLogDescription<{ _borrower: string; _debt: BigNumber; _coll: BigNumber; _operation: number }>[];
  extractEvents(logs: Log[], name: "TroveOwnersUpdated"): _TypedLogDescription<{ owner: string; newOwner: string; idx: BigNumber; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "TroveSnapshotsUpdated"): _TypedLogDescription<{ _L_ETH: BigNumber; _L_ARTHDebt: BigNumber }>[];
  extractEvents(logs: Log[], name: "TroveUpdated"): _TypedLogDescription<{ _borrower: string; _debt: BigNumber; _coll: BigNumber; _stake: BigNumber; _operation: number }>[];
  extractEvents(logs: Log[], name: "WETHAddressChanged"): _TypedLogDescription<{ _wethAddress: string }>[];
}

interface GovernanceCalls {
  DECIMAL_PRECISION(_overrides?: CallOverrides): Promise<BigNumber>;
  NAME(_overrides?: CallOverrides): Promise<string>;
  _100pct(_overrides?: CallOverrides): Promise<BigNumber>;
  borrowerOperationAddress(_overrides?: CallOverrides): Promise<string>;
  getAllowMinting(_overrides?: CallOverrides): Promise<boolean>;
  getBorrowingFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  getDeploymentStartTime(_overrides?: CallOverrides): Promise<BigNumber>;
  getFund(_overrides?: CallOverrides): Promise<string>;
  getGasCompensation(_overrides?: CallOverrides): Promise<BigNumber>;
  getMAHA(_overrides?: CallOverrides): Promise<string>;
  getMaxBorrowingFee(_overrides?: CallOverrides): Promise<BigNumber>;
  getMaxDebtCeiling(_overrides?: CallOverrides): Promise<BigNumber>;
  getMinNetDebt(_overrides?: CallOverrides): Promise<BigNumber>;
  getPriceFeed(_overrides?: CallOverrides): Promise<string>;
  getRedemptionFeeFloor(_overrides?: CallOverrides): Promise<BigNumber>;
  isOwner(_overrides?: CallOverrides): Promise<boolean>;
  owner(_overrides?: CallOverrides): Promise<string>;
  troveManagerAddress(_overrides?: CallOverrides): Promise<string>;
}

interface GovernanceTransactions {
  setAllowMinting(_value: boolean, _overrides?: Overrides): Promise<void>;
  setBorrowingFeeFloor(_value: BigNumberish, _overrides?: Overrides): Promise<void>;
  setFund(_newFund: string, _overrides?: Overrides): Promise<void>;
  setMAHA(_maha: string, _overrides?: Overrides): Promise<void>;
  setMaxBorrowingFee(_value: BigNumberish, _overrides?: Overrides): Promise<void>;
  setMaxDebtCeiling(_value: BigNumberish, _overrides?: Overrides): Promise<void>;
  setPriceFeed(_feed: string, _overrides?: Overrides): Promise<void>;
  setRedemptionFeeFloor(_value: BigNumberish, _overrides?: Overrides): Promise<void>;
  transferOwnership(newOwner: string, _overrides?: Overrides): Promise<void>;
}

export interface Governance
  extends _TypedARTHContract<GovernanceCalls, GovernanceTransactions> {
  readonly filters: {
    AllowMintingChanged(oldFlag?: null, newFlag?: null, timestamp?: null): EventFilter;
    BorrowingFeeFloorChanged(oldValue?: null, newValue?: null, timestamp?: null): EventFilter;
    FundAddressChanged(oldAddress?: null, newAddress?: null, timestamp?: null): EventFilter;
    MAHAChanged(oldAddress?: null, newAddress?: null, timestamp?: null): EventFilter;
    MaxBorrowingFeeChanged(oldValue?: null, newValue?: null, timestamp?: null): EventFilter;
    MaxDebtCeilingChanged(oldValue?: null, newValue?: null, timestamp?: null): EventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): EventFilter;
    PriceFeedChanged(oldAddress?: null, newAddress?: null, timestamp?: null): EventFilter;
    RedemptionFeeFloorChanged(oldValue?: null, newValue?: null, timestamp?: null): EventFilter;
    SentToFund(token?: null, amount?: null, timestamp?: null, reason?: null): EventFilter;
  };
  extractEvents(logs: Log[], name: "AllowMintingChanged"): _TypedLogDescription<{ oldFlag: boolean; newFlag: boolean; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "BorrowingFeeFloorChanged"): _TypedLogDescription<{ oldValue: BigNumber; newValue: BigNumber; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "FundAddressChanged"): _TypedLogDescription<{ oldAddress: string; newAddress: string; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "MAHAChanged"): _TypedLogDescription<{ oldAddress: string; newAddress: string; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "MaxBorrowingFeeChanged"): _TypedLogDescription<{ oldValue: BigNumber; newValue: BigNumber; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "MaxDebtCeilingChanged"): _TypedLogDescription<{ oldValue: BigNumber; newValue: BigNumber; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "OwnershipTransferred"): _TypedLogDescription<{ previousOwner: string; newOwner: string }>[];
  extractEvents(logs: Log[], name: "PriceFeedChanged"): _TypedLogDescription<{ oldAddress: string; newAddress: string; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "RedemptionFeeFloorChanged"): _TypedLogDescription<{ oldValue: BigNumber; newValue: BigNumber; timestamp: BigNumber }>[];
  extractEvents(logs: Log[], name: "SentToFund"): _TypedLogDescription<{ token: string; amount: BigNumber; timestamp: BigNumber; reason: string }>[];
}
