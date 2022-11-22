// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract MrMeeseeks {
    address public owner;
    string public purpose;

    event ImMrMeeseeksLookAtMe();
    event Pfff();
    
    constructor(string memory _purpose, address _owner) {
        owner = _owner;
        purpose = _purpose;
        emit ImMrMeeseeksLookAtMe();
    }

    function fullfillPurpose() external {
        require(msg.sender == owner, "Only owner can fullfill my purpose");
        emit Pfff();
        selfdestruct(payable(msg.sender));
    }

}