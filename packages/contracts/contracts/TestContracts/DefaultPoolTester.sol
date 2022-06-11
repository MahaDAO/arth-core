// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "../DefaultPool.sol";

contract DefaultPoolTester is DefaultPool {
    using SafeMath for uint256;

    function unprotectedIncreaseARTHDebt(uint256 _amount) external {
        ARTHDebt = ARTHDebt.add(_amount);
    }

    function unprotectedPayable() external payable {
        ETH = ETH.add(msg.value);
    }
}
