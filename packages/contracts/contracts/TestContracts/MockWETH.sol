// SPDX-License-Identifier: MIT
// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import {MockERC20} from "./MockERC20.sol";

interface IWETHFeatures {
    function deposit() external payable;

    function withdraw(uint256) external;
}

contract MockWETH is IWETHFeatures, MockERC20 {
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    constructor(string memory name, string memory symbol) MockERC20(name, symbol) {}

    fallback() external payable {
        deposit();
    }

    receive() external payable {}

    function deposit() public payable override {
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 wad) public override {
        _burn(msg.sender, wad);

        (bool success, ) = msg.sender.call{value: wad}("");
        require(success, "Withdraw failed");

        emit Withdrawal(msg.sender, wad);
    }
}
