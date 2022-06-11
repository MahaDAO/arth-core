// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "./IPriceFeed.sol";
import "../Interfaces/IERC20.sol";
import "../Interfaces/IOracle.sol";
import "../Interfaces/IEcosystemFund.sol";

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
    event StabilityFeeCharged(uint256 ARTHAmount, uint256 feeAmount, uint256 timestamp);
    event EcosystemFundAddressChanged(address oldAddress, address newAddress, uint256 timestamp);
    event SentToEcosystemFund(uint256 amount, uint256 timestamp, string reason);

    // --- Functions ---

    function getDeploymentStartTime() external view returns (uint256);

    function getPriceFeed() external view returns (IPriceFeed);

    function getStabilityFeePercentage() external view returns (uint256);

    function getStabilityFeeToken() external view returns (IBurnableERC20);

    function getStabilityTokenOracle() external view returns (IOracle);

    function getEcosystemFund() external view returns (IEcosystemFund);

    function chargeStabilityFee(address _who, uint256 _ARTHAmount) external;

    function setEcosystemFund(address _ecosystemFund) external;

    function setPriceFeed(address _priceFeed) external;

    function setStabilityFeePercentage(uint256 _stabilityFeePercentage) external;

    function setStabilityFeeToken(address _token, address _oracle) external;

    function sendRedeemFeeToEcosystemFund(uint256 amount) external;
}
