// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../PriceFeeds/LinkTellorPriceFeed.sol";

contract PriceFeedTester is PriceFeed {

    function setLastGoodPrice(uint _lastGoodPrice) external {
        lastGoodPrice = _lastGoodPrice;
    }

    function setStatus(Status _status) external {
        status = _status;
    }
}