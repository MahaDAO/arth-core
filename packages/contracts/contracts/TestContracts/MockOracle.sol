// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import {SafeMath} from "../Dependencies/SafeMath.sol";
import {IPriceFeed} from "../Interfaces/IPriceFeed.sol";

contract MockOracle is IPriceFeed {
    using SafeMath for uint256;

    uint256 public price = 1000e18;

    function setPrice(uint256 _price) public {
        price = _price;
    }

    function getPrice() external view returns (uint256) {
        return price;
    }

    function fetchPrice() external override returns (uint256) {
        return price;
    }

    function canUpdate() external pure returns (bool) {
        return true;
    }

    function update() external {
        emit Updated(price, price);
    }

    function consult(address, uint256 amountIn) external view returns (uint256) {
        return price.mul(amountIn).div(1e18);
    }

    event Updated(uint256 price0CumulativeLast, uint256 price1CumulativeLast);
}
