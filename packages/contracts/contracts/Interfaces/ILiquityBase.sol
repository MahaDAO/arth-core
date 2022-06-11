// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "./IGovernance.sol";

interface ILiquityBase {
    function governance() external view returns (IGovernance);
}
