// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "./Interfaces/ICommunityIssuance.sol";
import "./Dependencies/BaseMath.sol";
import "./Dependencies/LiquityMath.sol";
import "./Dependencies/Ownable.sol";
import "./Dependencies/CheckContract.sol";
import "./Dependencies/SafeMath.sol";
import "./Dependencies/IERC20.sol";

contract CommunityIssuance is ICommunityIssuance, Ownable, CheckContract, BaseMath {
    using SafeMath for uint;

    // --- Data ---

    string constant public NAME = "CommunityIssuance";

    uint public lastUpdateTime;
    uint public rewardRate = 0;
    uint public rewardsDuration;
    uint public periodFinish = 0;

    IERC20 public lqtyToken;

    address public stabilityPoolAddress;

    uint public totalLQTYIssued;
    uint public immutable deploymentTime;

    // --- Events ---

    event LQTYTokenAddressSet(address _lqtyTokenAddress);
    event StabilityPoolAddressSet(address _stabilityPoolAddress);
    event TotalLQTYIssuedUpdated(uint _totalLQTYIssued);

    // --- Functions ---

    constructor() public {
        deploymentTime = block.timestamp;
    }

    function setAddresses
    (
        address _lqtyTokenAddress, 
        address _stabilityPoolAddress,
        uint _rewardsDuration
    ) 
        external 
        onlyOwner 
        override 
    {
        checkContract(_lqtyTokenAddress);
        checkContract(_stabilityPoolAddress);

        lqtyToken = IERC20(_lqtyTokenAddress);
        stabilityPoolAddress = _stabilityPoolAddress;

        uint LQTYBalance = lqtyToken.balanceOf(address(this));
        assert(LQTYBalance > 0);

        emit LQTYTokenAddressSet(_lqtyTokenAddress);
        emit StabilityPoolAddressSet(_stabilityPoolAddress);

        lastUpdateTime = block.timestamp;
        rewardsDuration = _rewardsDuration;
        periodFinish = block.timestamp.add(rewardsDuration);
        rewardRate = lqtyToken.balanceOf(address(this)).div(rewardsDuration);
    }

    function issueLQTY() external override returns (uint) {
        _requireCallerIsStabilityPool();

        uint issuance  = _getCumulativeIssuance();

        totalLQTYIssued = totalLQTYIssued.add(issuance);
        emit TotalLQTYIssuedUpdated(totalLQTYIssued);

        lastUpdateTime = block.timestamp;

        return issuance;
    }

    function notifyRewardAmount(uint256 reward)
        external
        override
        onlyOwner
    {
        if (block.timestamp >= periodFinish) {
            rewardRate = reward.div(rewardsDuration);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(rewardsDuration);
        }

        // Ensure the provided reward amount is not more than the balance in the contract.
        // This keeps the reward rate in the right range, preventing overflows due to
        // very high values of rewardRate in the earned and rewardsPerToken functions;
        // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
        uint256 balance = lqtyToken.balanceOf(address(this));
        require(
            rewardRate <= balance.div(rewardsDuration),
            'Provided reward too high'
        );

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardAdded(reward);
    }
    
    function lastTimeRewardApplicable() public view override returns (uint256) {
        return LiquityMath._min(block.timestamp, periodFinish);
    }

    function _getCumulativeIssuance() internal view returns (uint) {
        uint256 rewards = rewardRate.mul(lastTimeRewardApplicable().sub(lastUpdateTime));

        return LiquityMath._min(rewards, lqtyToken.balanceOf(address(this)));
    }

    function sendLQTY(address _account, uint _LQTYamount) external override {
        _requireCallerIsStabilityPool();

        lqtyToken.transfer(_account, _LQTYamount);
    }

    // --- 'require' functions ---

    function _requireCallerIsStabilityPool() internal view {
        require(msg.sender == stabilityPoolAddress, "CommunityIssuance: caller is not SP");
    }
}
