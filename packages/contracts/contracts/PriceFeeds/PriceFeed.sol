// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import {IPriceFeed} from "../Interfaces/IPriceFeed.sol";
import {SafeMath} from "../Dependencies/SafeMath.sol";
import {CheckContract} from "../Dependencies/CheckContract.sol";

/*
 * PriceFeed for mainnet deployment, to be connected to Chainlink's live ETH:USD aggregator reference
 * contract.
 *
 * The PriceFeed uses Chainlink as primary oracle.
 */
contract PriceFeed is CheckContract, IPriceFeed {
    using SafeMath for uint256;

    string public constant NAME = "PriceFeed";

    IPriceFeed public ethUSDpricefeed;
    IPriceFeed public gmuOracle;

    // Use to convert a price answer to an 18-digit precision uint.
    uint256 public lastGoodPrice;

    constructor(address _ethUSDpricefeed, address _gmuOracle) {
        checkContract(_ethUSDpricefeed);
        checkContract(_gmuOracle);

        ethUSDpricefeed = IPriceFeed(_ethUSDpricefeed);
        gmuOracle = IPriceFeed(_gmuOracle);
    }

    function fetchPrice() external override returns (uint256) {
        uint256 gmuPrice = gmuOracle.fetchPrice();
        uint256 chainlinkPrice = ethUSDpricefeed.fetchPrice();

        lastGoodPrice = (chainlinkPrice.mul(1e18).div(gmuPrice));

        emit LastGoodPriceUpdated(lastGoodPrice);
        return lastGoodPrice;
    }
}
