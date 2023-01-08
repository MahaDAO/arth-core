// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "../CommunityIssuance.sol";

contract CommunityIssuanceTester is CommunityIssuance {
    constructor(
        address _governance,
        address _stabilityPoolAddress,
        uint256 _rewardsDuration
    ) CommunityIssuance(_governance, _stabilityPoolAddress, _rewardsDuration) {
        // nothing
    }

    function obtainMAHA(uint256 _amount) external {
        governance.getMAHA().transfer(msg.sender, _amount);
    }

    function getCumulativeIssuanceFraction() external view returns (uint256) {
        return _getCumulativeIssuance();
    }

    function unprotectedIssueMAHA() external view returns (uint256) {
        // No checks on caller address
        return _getCumulativeIssuance();
    }
}
