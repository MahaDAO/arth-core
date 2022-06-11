// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "../CommunityIssuance.sol";

contract CommunityIssuanceTester is CommunityIssuance {
    function obtainLQTY(uint256 _amount) external {
        lqtyToken.transfer(msg.sender, _amount);
    }

    function getCumulativeIssuanceFraction() external view returns (uint256) {
        return _getCumulativeIssuance();
    }

    function unprotectedIssueLQTY() external view returns (uint256) {
        // No checks on caller address
        return _getCumulativeIssuance();
    }
}
