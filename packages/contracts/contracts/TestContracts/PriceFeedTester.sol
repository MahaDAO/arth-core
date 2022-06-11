// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "../PriceFeeds/LinkTellorPriceFeed.sol";

contract PriceFeedTester is LinkTellorPriceFeed {
    function setLastGoodPrice(uint256 _lastGoodPrice) external {
        lastGoodPrice = _lastGoodPrice;
    }

    function setStatus(Status _status) external {
        status = _status;
    }
}
