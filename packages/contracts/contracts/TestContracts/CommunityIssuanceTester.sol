// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../CommunityIssuance.sol";

contract CommunityIssuanceTester is CommunityIssuance {
    function obtainLQTY(uint _amount) external {
        lqtyToken.transfer(msg.sender, _amount);
    }

    function getCumulativeIssuanceFraction() external view returns (uint) {
       return _getCumulativeIssuance();
    }

    function unprotectedIssueLQTY() external view returns (uint) {
        // No checks on caller address
        return _getCumulativeIssuance();
    }
}
