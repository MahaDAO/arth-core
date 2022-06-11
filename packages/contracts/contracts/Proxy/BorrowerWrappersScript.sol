// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "../Dependencies/SafeMath.sol";
import "../Dependencies/LiquityMath.sol";
import "../Interfaces/IERC20.sol";
import "../Interfaces/IBorrowerOperations.sol";
import "../Interfaces/ITroveManager.sol";
import "../Interfaces/IStabilityPool.sol";
import "../Interfaces/IPriceFeed.sol";
import "./BorrowerOperationsScript.sol";
import "./ETHTransferScript.sol";
import "../Dependencies/console.sol";
import "../Interfaces/IGovernance.sol";

contract BorrowerWrappersScript is BorrowerOperationsScript, ETHTransferScript {
    using SafeMath for uint256;

    string public constant NAME = "BorrowerWrappersScript";

    ITroveManager immutable troveManager;
    IStabilityPool immutable stabilityPool;
    IERC20 immutable arthToken;

    constructor(address _borrowerOperationsAddress, address _troveManagerAddress)
        BorrowerOperationsScript(IBorrowerOperations(_borrowerOperationsAddress))
    {
        checkContract(_troveManagerAddress);
        ITroveManager troveManagerCached = ITroveManager(_troveManagerAddress);
        troveManager = troveManagerCached;

        IStabilityPool stabilityPoolCached = troveManagerCached.stabilityPool();
        checkContract(address(stabilityPoolCached));
        stabilityPool = stabilityPoolCached;

        address arthTokenCached = address(troveManagerCached.arthToken());
        checkContract(arthTokenCached);
        arthToken = IERC20(arthTokenCached);
    }

    function claimCollateralAndOpenTrove(
        uint256 _maxFee,
        uint256 _ARTHAmount,
        address _upperHint,
        address _lowerHint,
        address _frontEndTag
    ) external payable {
        uint256 balanceBefore = address(this).balance;

        // Claim collateral
        borrowerOperations.claimCollateral();

        uint256 balanceAfter = address(this).balance;

        // already checked in CollSurplusPool
        assert(balanceAfter > balanceBefore);

        uint256 totalCollateral = balanceAfter.sub(balanceBefore).add(msg.value);

        // Open trove with obtained collateral, plus collateral sent by user
        borrowerOperations.openTrove{value: totalCollateral}(
            _maxFee,
            _ARTHAmount,
            _upperHint,
            _lowerHint,
            _frontEndTag
        );
    }

    function _getNetARTHAmount(uint256 _collateral) internal returns (uint256) {
        // IGovernance governance = troveManager.governance();
        // IPriceFeed priceFeed = governance.getPriceFeed();
        // uint256 price = priceFeed.fetchPrice();
        // uint256 ICR = troveManager.getCurrentICR(address(this), price);

        // uint256 ARTHAmount = _collateral.mul(price).div(ICR);
        // uint256 borrowingRate = troveManager.getBorrowingRateWithDecay();
        // uint256 netDebt = ARTHAmount.mul(LiquityMath.DECIMAL_PRECISION).div(
        //     LiquityMath.DECIMAL_PRECISION.add(borrowingRate)
        // );

        // return netDebt;
        return 0;
    }

    function _requireUserHasTrove(address _depositor) internal view {
        require(
            troveManager.getTroveStatus(_depositor) == 1,
            "BorrowerWrappersScript: caller must have an active trove"
        );
    }
}
