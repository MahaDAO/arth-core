// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "./Interfaces/IWETH.sol";
import "./Interfaces/IERC20.sol";
import "./Dependencies/Ownable.sol";
import "./Dependencies/BaseMath.sol";
import "./Interfaces/IGovernance.sol";
import "./Dependencies/LiquityMath.sol";

contract Governance is BaseMath, Ownable, IGovernance {
    using SafeMath for uint256;

    string public constant NAME = "Governance";

    // --- Data ---

    address public immutable activePoolAddress;
    address public immutable troveManagerAddress;

    uint256 private stabilityFeePercentage = 0;
    uint256 private constant _100pct = 1000000000000000000; // 1e18 == 100%
    uint256 private immutable deploymentStartTime;

    IPriceFeed private priceFeed;
    address public ecosystemFund;
    IOracle private stabilityTokenOracle;
    IBurnableERC20 private stabilityFeeToken;

    constructor(
        address _governance,
        address _activePoolAddress,
        address _troveManagerAddress,
        address _priceFeed,
        address _ecosystemFund
    ) {
        activePoolAddress = _activePoolAddress;
        troveManagerAddress = _troveManagerAddress;

        priceFeed = IPriceFeed(_priceFeed);
        ecosystemFund = _ecosystemFund;

        deploymentStartTime = block.timestamp;
        transferOwnership(_governance);
    }

    // --- Governance setters ---

    function setEcosystemFund(address _ecosystemFund) external override onlyOwner {
        address oldAddress = ecosystemFund;
        ecosystemFund = _ecosystemFund;
        emit EcosystemFundAddressChanged(oldAddress, _ecosystemFund, block.timestamp);
    }

    function setPriceFeed(address _priceFeed) external override onlyOwner {
        address oldAddress = address(priceFeed);
        priceFeed = IPriceFeed(_priceFeed);
        emit PriceFeedChanged(oldAddress, _priceFeed, block.timestamp);
    }

    function setStabilityFeePercentage(uint256 _stabilityFeePercentage) external override onlyOwner {
        uint256 oldValue = stabilityFeePercentage;
        stabilityFeePercentage = _stabilityFeePercentage;
        emit StabilityFeePercentageChanged(oldValue, _stabilityFeePercentage, block.timestamp);
    }

    function setStabilityFeeToken(address _token, address _oracle) external override onlyOwner {
        address oldAddress = address(stabilityFeeToken);
        stabilityFeeToken = IBurnableERC20(_token);
        emit StabilityFeeTokenChanged(oldAddress, _token, block.timestamp);

        oldAddress = address(stabilityTokenOracle);
        stabilityTokenOracle = IOracle(_oracle);
        emit StabilityTokenOracleChanged(oldAddress, _oracle, block.timestamp);
    }

    // ---  Governance getters ---

    function getDeploymentStartTime() external view override returns (uint256) {
        return deploymentStartTime;
    }

    function getEcosystemFund() external view override returns (address) {
        return ecosystemFund;
    }

    function getStabilityFeePercentage() external view override returns (uint256) {
        return stabilityFeePercentage;
    }

    function getStabilityTokenOracle() external view override returns (IOracle) {
        return stabilityTokenOracle;
    }

    function getStabilityFeeToken() external view override returns (IBurnableERC20) {
        return stabilityFeeToken;
    }

    function getPriceFeed() external view override returns (IPriceFeed) {
        return priceFeed;
    }

    // --- Governance fee charging functions ---

    function chargeStabilityFee(address _who, uint256 _ARTHAmount) external override {
        _requireCallerIsTroveManager();

        if (
            address(stabilityTokenOracle) == address(0) ||
            address(stabilityFeeToken) == address(0) ||
            stabilityFeePercentage == 0
        ) {
            return;
        }

        uint256 stabilityFeeInARTH = _ARTHAmount.mul(stabilityFeePercentage).div(_100pct);
        uint256 stabilityTokenPriceInARTH = stabilityTokenOracle.getPrice();
        uint256 stabilityFee = stabilityFeeInARTH.mul(1e18).div(stabilityTokenPriceInARTH);

        if (stabilityFee > 0 && stabilityFeePercentage > 0) {
            stabilityFeeToken.burnFrom(_who, stabilityFee);
            emit StabilityFeeCharged(_ARTHAmount, stabilityFee, block.timestamp);
        }
    }

    function sendRedeemFeeToEcosystemFund(uint256 _ETHFee) external payable override {
        _requireCallerIsTroveManager();
        require(address(this).balance >= _ETHFee, "Governance: not enough ETH fee balance"); // TroveManager should already send ETH via active pool to this contract.
        payable(address(this)).transfer(_ETHFee);
        emit SentToEcosystemFund(_ETHFee, block.timestamp, "Redeem fee triggered");
    }

    // --- Governance require functions ---

    function _requireCallerIsTroveManager() internal view {
        require(msg.sender == troveManagerAddress, "Governance: Caller is not TroveManager");
    }

    function _requireCallerIsActivePool() internal view {
        require(msg.sender == activePoolAddress, "Governance: Caller is not ActivePool");
    }

    // --- Fallback function ---

    receive() external payable {
        _requireCallerIsActivePool();
    }
}
