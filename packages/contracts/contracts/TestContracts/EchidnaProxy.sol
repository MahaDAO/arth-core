// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "../TroveManager.sol";
import "../BorrowerOperations.sol";
import "../StabilityPool.sol";
import "../ARTHValuecoin.sol";

contract EchidnaProxy {
    TroveManager troveManager;
    BorrowerOperations borrowerOperations;
    StabilityPool stabilityPool;
    ARTHValuecoin arthToken;

    constructor(
        TroveManager _troveManager,
        BorrowerOperations _borrowerOperations,
        StabilityPool _stabilityPool,
        ARTHValuecoin _arthToken
    ) {
        troveManager = _troveManager;
        borrowerOperations = _borrowerOperations;
        stabilityPool = _stabilityPool;
        arthToken = _arthToken;
    }

    receive() external payable {
        // do nothing
    }

    // TroveManager

    function liquidatePrx(address _user) external {
        troveManager.liquidate(_user);
    }

    function liquidateTrovesPrx(uint256 _n) external {
        troveManager.liquidateTroves(_n);
    }

    function batchLiquidateTrovesPrx(address[] calldata _troveArray) external {
        troveManager.batchLiquidateTroves(_troveArray);
    }

    function redeemCollateralPrx(
        uint256 _ARTHAmount,
        address _firstRedemptionHint,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint,
        uint256 _partialRedemptionHintNICR,
        uint256 _maxIterations,
        uint256 _maxFee
    ) external {
        troveManager.redeemCollateral(
            _ARTHAmount,
            _firstRedemptionHint,
            _upperPartialRedemptionHint,
            _lowerPartialRedemptionHint,
            _partialRedemptionHintNICR,
            _maxIterations,
            _maxFee
        );
    }

    // Borrower Operations
    function openTrovePrx(
        uint256 _ETH,
        uint256 _ARTHAmount,
        address _upperHint,
        address _lowerHint,
        uint256 _maxFee,
        address _frontEndTag
    ) external payable {
        borrowerOperations.openTrove{value: _ETH}(
            _maxFee,
            _ARTHAmount,
            _upperHint,
            _lowerHint,
            _frontEndTag
        );
    }

    function addCollPrx(
        uint256 _ETH,
        address _upperHint,
        address _lowerHint
    ) external payable {
        borrowerOperations.addColl{value: _ETH}(_upperHint, _lowerHint);
    }

    function withdrawCollPrx(
        uint256 _amount,
        address _upperHint,
        address _lowerHint
    ) external {
        borrowerOperations.withdrawColl(_amount, _upperHint, _lowerHint);
    }

    function withdrawARTHPrx(
        uint256 _amount,
        address _upperHint,
        address _lowerHint,
        uint256 _maxFee
    ) external {
        borrowerOperations.withdrawARTH(_maxFee, _amount, _upperHint, _lowerHint);
    }

    function repayARTHPrx(
        uint256 _amount,
        address _upperHint,
        address _lowerHint
    ) external {
        borrowerOperations.repayARTH(_amount, _upperHint, _lowerHint);
    }

    function closeTrovePrx() external {
        borrowerOperations.closeTrove();
    }

    function adjustTrovePrx(
        uint256 _ETH,
        uint256 _collWithdrawal,
        uint256 _debtChange,
        bool _isDebtIncrease,
        address _upperHint,
        address _lowerHint,
        uint256 _maxFee
    ) external payable {
        borrowerOperations.adjustTrove{value: _ETH}(
            _maxFee,
            _collWithdrawal,
            _debtChange,
            _isDebtIncrease,
            _upperHint,
            _lowerHint
        );
    }

    // Pool Manager
    function provideToSPPrx(uint256 _amount, address _frontEndTag) external {
        stabilityPool.provideToSP(_amount, _frontEndTag);
    }

    function withdrawFromSPPrx(uint256 _amount) external {
        stabilityPool.withdrawFromSP(_amount);
    }

    // ARTH Token

    function transferPrx(address recipient, uint256 amount) external returns (bool) {
        return arthToken.transfer(recipient, amount);
    }

    function approvePrx(address spender, uint256 amount) external returns (bool) {
        return arthToken.approve(spender, amount);
    }

    function transferFromPrx(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        return arthToken.transferFrom(sender, recipient, amount);
    }

    function increaseAllowancePrx(address spender, uint256 addedValue) external returns (bool) {
        return arthToken.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowancePrx(address spender, uint256 subtractedValue) external returns (bool) {
        return arthToken.decreaseAllowance(spender, subtractedValue);
    }
}
