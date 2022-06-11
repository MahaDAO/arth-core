// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

interface ICommunityIssuance {
    // --- Events ---

    event LQTYTokenAddressSet(address _lqtyTokenAddress);
    event StabilityPoolAddressSet(address _stabilityPoolAddress);
    event TotalLQTYIssuedUpdated(uint256 _totalLQTYIssued);
    event RewardAdded(uint256 reward);

    // --- Functions ---

    function setAddresses(
        address _lqtyTokenAddress,
        address _stabilityPoolAddress,
        uint256 _rewardsDuration
    ) external;

    function issueLQTY() external returns (uint256);

    function sendLQTY(address _account, uint256 _LQTYamount) external;

    function lastTimeRewardApplicable() external view returns (uint256);

    function notifyRewardAmount(uint256 reward) external;
}
