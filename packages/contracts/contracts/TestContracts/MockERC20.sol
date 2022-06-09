// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import { ERC20, ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

contract MockERC20 is ERC20Burnable {
    constructor(
        string memory name,
        string memory symbol
    ) public payable ERC20(name, symbol) {
        _mint(msg.sender, 1_000_000 ether);
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}