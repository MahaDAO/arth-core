// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "./Dependencies/IWETH.sol";
import "./Dependencies/IERC20.sol";
import "./Dependencies/Ownable.sol";
import "./Dependencies/BaseMath.sol";
import "./Interfaces/IGovernance.sol";
import "./Dependencies/LiquityMath.sol";
import "./Dependencies/IEcosystemFund.sol";

contract Governance is IGovernance, BaseMath, Ownable {
    using SafeMath for uint256;

    string public constant NAME = "Governance";

    // --- Data ---

    address public immutable troveManagerAddress;
    address public immutable borrowerOperationAddress;

    uint private stabilityFeePercentage = 0;
    uint private constant _100pct = 1000000000000000000; // 1e18 == 100%

    IPriceFeed private priceFeed;
    IEcosystemFund private ecosystemFund;
    IOracle private stabilityTokenOracle;
    IBurnableERC20 private stabilityFeeToken;

    IWETH private immutable wrappedETH;

    // --- Events ---

    event StabilityFeePercentageChanged(uint256 oldValue, uint256 newValue, uint256 timestamp);
    event PriceFeedChanged(address oldAddress, address newAddress, uint256 timestamp);
    event StabilityFeeTokenChanged(address oldAddress, address newAddress, uint256 timestamp);
    event StabilityTokenOracleChanged(address oldAddress, address newAddress, uint256 timestamp);
    event StabilityFeeCharged(uint256 LUSDAmount, uint256 feeAmount, uint256 timestamp);
    event EcosystemFundAddressChanged(address oldAddress, address newAddress, uint256 timestamp);
    event SentToEcosystemFund(address token, uint256 amount, uint256 timestamp, string reason);

    constructor(
        address _governance, 
        address _troveManagerAddress, 
        address _borrowerOperationAddress, 
        address _priceFeed, 
        address _ecosystemFund,
        address _wrappedETH
    ) public {
        troveManagerAddress = _troveManagerAddress;
        borrowerOperationAddress = _borrowerOperationAddress;
        
        wrappedETH = IWETH(_wrappedETH);
        priceFeed = IPriceFeed(_priceFeed);
        ecosystemFund = IEcosystemFund(_ecosystemFund);

        transferOwnership(_governance);
    }

    // --- Governance setters ---

    function setEcosystemFund(address _ecosystemFund) external override onlyOwner {
        address oldAddress = address(ecosystemFund);
        ecosystemFund = IEcosystemFund(_ecosystemFund);
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

    function getEcosystemFund() external view override returns (IEcosystemFund) {
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

    function chargeStabilityFee(address _who, uint256 _LUSDAmount) external override {
        _requireCallerIsTroveManager();

        if (
            address(stabilityTokenOracle) == address(0) ||
            address(stabilityFeeToken) == address(0) ||
            stabilityFeePercentage == 0
        ) { return; }

        uint256 stabilityFeeInLUSD = _LUSDAmount.mul(stabilityFeePercentage).div(_100pct);
        uint256 stabilityTokenPriceInLUSD = stabilityTokenOracle.getPrice();
        uint256 stabilityFee = stabilityFeeInLUSD.mul(1e18).div(stabilityTokenPriceInLUSD);

        if (stabilityFee > 0 && stabilityFeePercentage > 0) {
            stabilityFeeToken.burnFrom(_who, stabilityFee);
            emit StabilityFeeCharged(_LUSDAmount, stabilityFee, block.timestamp);
        }
    }

    function sendToEcosystemFund(
        address token,
        uint256 amount,
        string memory reason,
        bool isSendingETH
    ) external payable override {
        _requireCallerIsBOorTroveM();

        address _token = token;
        
        if (isSendingETH) {
            require(token == address(0), "Governance: address should be 0x0 while sending ETH");
            _token = address(wrappedETH);
            wrappedETH.deposit{ value: msg.value }();
        }

        IERC20(_token).approve(address(ecosystemFund), amount);
        ecosystemFund.deposit(_token, amount, reason);
        emit SentToEcosystemFund(_token, amount, block.timestamp, reason);
    }

    // --- Governance require functions ---

    function _requireCallerIsTroveManager() internal view {
        require(msg.sender == troveManagerAddress, "Governance: Caller is not TroveManager");
    }

    function _requireCallerIsBOorTroveM() internal view {
        require(
            msg.sender == borrowerOperationAddress || msg.sender == troveManagerAddress,
            "Governance: Caller is neither BorrowerOperations nor TroveManager"
        );
    }

    // --- Fallback functions ---

    receive() external payable {}
}