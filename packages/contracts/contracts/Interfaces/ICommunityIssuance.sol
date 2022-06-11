// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

interface ICommunityIssuance {
    // --- Events ---

    event MAHATokenAddressSet(address _mahaTokenAddress);
    event StabilityPoolAddressSet(address _stabilityPoolAddress);
    event TotalMAHAIssuedUpdated(uint256 _totalMAHAIssued);
    event RewardAdded(uint256 reward);

    // --- Functions ---

    function setAddresses(
        address _mahaTokenAddress,
        address _stabilityPoolAddress,
        uint256 _rewardsDuration
    ) external;

    function issueMAHA() external returns (uint256);

    function sendMAHA(address _account, uint256 _MAHAamount) external;

    function lastTimeRewardApplicable() external view returns (uint256);

    function notifyRewardAmount(uint256 reward) external;
}
