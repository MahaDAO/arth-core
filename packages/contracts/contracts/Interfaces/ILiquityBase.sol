// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "./IGovernance.sol";


interface ILiquityBase {
    function governance() external view returns (IGovernance);
}
