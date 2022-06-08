// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

interface IEcosystemFund {
    function deposit(
        address token,
        uint256 amount,
        string memory reason
    ) external;

    function withdraw(
        address token,
        uint256 amount,
        address to,
        string memory reason
    ) external;
}