// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "../Interfaces/IARTHValuecoin.sol";

contract ARTHTokenCaller {
    IARTHValuecoin ARTH;

    function setARTH(IARTHValuecoin _ARTH) external {
        ARTH = _ARTH;
    }

    function arthMint(address _account, uint256 _amount) external {
        ARTH.mint(_account, _amount);
    }

    function arthBurn(address _account, uint256 _amount) external {
        ARTH.burn(_account, _amount);
    }

    function arthSendToPool(
        address _sender,
        address _poolAddress,
        uint256 _amount
    ) external {
        ARTH.sendToPool(_sender, _poolAddress, _amount);
    }

    function arthReturnFromPool(
        address _poolAddress,
        address _receiver,
        uint256 _amount
    ) external {
        ARTH.returnFromPool(_poolAddress, _receiver, _amount);
    }
}
