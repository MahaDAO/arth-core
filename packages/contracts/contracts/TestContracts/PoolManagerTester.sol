pragma solidity 0.5.16;

import "../PoolManager.sol";


contract PoolManagerTester is PoolManager {
    function clvMint(address _account, uint _amount) external {
        CLV.mint(_account, _amount);
    }

    function clvBurn(address _account, uint _amount) external {
        CLV.burn(_account, _amount);
    }

    function clvSendToPool(address _sender,  address _poolAddress, uint256 _amount) external {
        CLV.sendToPool(_sender, _poolAddress, _amount);
    }

    function clvReturnFromPool(address _poolAddress, address _receiver, uint256 _amount ) external {
        CLV.returnFromPool(_poolAddress, _receiver, _amount);
    }

    function _unprotectedTriggerLQTYIssuance() external {
        _triggerLQTYIssuance();
    }
}
