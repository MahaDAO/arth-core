// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "./IPriceFeed.sol";
import "../Dependencies/IERC20.sol";
import "../Dependencies/IOracle.sol";
import "../Dependencies/IEcosystemFund.sol";

interface IBurnableERC20 is IERC20 {
    function burn(uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;
}

interface IGovernance {
    // --- Events ---

    event StabilityFeePercentageChanged(uint256 oldValue, uint256 newValue, uint256 timestamp);
    event PriceFeedChanged(address oldAddress, address newAddress, uint256 timestamp);
    event StabilityFeeTokenChanged(address oldAddress, address newAddress, uint256 timestamp);
    event StabilityTokenOracleChanged(address oldAddress, address newAddress, uint256 timestamp);
    event StabilityFeeCharged(uint256 LUSDAmount, uint256 feeAmount, uint256 timestamp);
    event EcosystemFundAddressChanged(address oldAddress, address newAddress, uint256 timestamp);

    // --- Functions ---
    
    function getDeploymentStartTime() external view returns (uint);

    function getPriceFeed() external view returns (IPriceFeed);

    function getStabilityFeePercentage() external view returns (uint);

    function getStabilityFeeToken() external view returns (IBurnableERC20);

    function getStabilityTokenOracle() external view returns (IOracle);

    function getEcosystemFund() external view returns (IEcosystemFund);

    function chargeStabilityFee(address _who, uint256 _LUSDAmount) external;

    function setEcosystemFund(address _ecosystemFund) external;

    function setPriceFeed(address _priceFeed) external;

    function setStabilityFeePercentage(uint256 _stabilityFeePercentage) external;

    function setStabilityFeeToken(address _token, address _oracle) external;
}