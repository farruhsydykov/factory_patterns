// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

// We could just use Initialize library from OpenZeppelin
// but let's implement it's functionality ourselfs

contract MrMeeseeks_Implementation {
    uint8 initialized;
    address public owner;
    string public purpose;

    event ImMrMeeseeksLookAtMe(string _purpose, uint256 _createdAt);
    event Pfff(uint256 _deathAt);

    modifier initializer() {
        require(initialized == 0, "Already initialized");
        _;
        initialized = 1;
    }
    
    function initialize(string memory _purpose, address _owner) external initializer{
        owner = _owner;
        purpose = _purpose;
        emit ImMrMeeseeksLookAtMe(_purpose, block.timestamp);
    }

    function fullfillPurpose() external {
        require(msg.sender == owner, "Only owner can fullfill my purpose");
        emit Pfff(block.timestamp);
        selfdestruct(payable(msg.sender));
    }

}