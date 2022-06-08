// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "./IPriceFeed.sol";
import "../Dependencies/IERC20.sol";
import "../Dependencies/IOracle.sol";
import "../Dependencies/IEcosystemFund.sol";

interface IGovernance {
    // --- Events ---

    event StabilityFeePercentageChanged(uint256 oldValue, uint256 newValue, uint256 timestamp);
    event PriceFeedChanged(address oldAddress, address newAddress, uint256 timestamp);
    event StabilityFeeTokenChanged(address oldAddress, address newAddress, uint256 timestamp);
    event StabilityTokenOracleChanged(address oldAddress, address newAddress, uint256 timestamp);
    event StabilityFeeCharged(uint256 LUSDAmount, uint256 feeAmount, uint256 timestamp);
    event EcosystemFundAddressChanged(address oldAddress, address newAddress, uint256 timestamp);
    event SentToEcosystemFund(address token, uint256 amount, uint256 timestamp, string reason);

    // --- Functions ---

    function getPriceFeed() external view returns (IPriceFeed);

    function getStabilityFeePercentage() external view returns (uint256);

    function getStabilityFeeToken() external view returns (IERC20);

    function getStabilityTokenOracle() external view returns (IOracle);

    function getEcosystemFund() external view returns (IEcosystemFund);

    function chargeStabilityFee(address _who, uint256 _LUSDAmount) external;

    function sendToEcosystemFund(address token, uint256 amount, string memory reason, bool isSendingETH) external payable;

    function setEcosystemFund(address _ecosystemFund) external;

    function setPriceFeed(address _priceFeed) external;

    function setStabilityFeePercentage(uint256 _stabilityFeePercentage) external;

    function setStabilityFeeToken(address _token, IOracle _oracle) external;
}