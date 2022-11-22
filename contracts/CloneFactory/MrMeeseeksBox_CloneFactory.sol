// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "./MrMeeseeks_Implementation.sol";

contract MrMeeseeksBox_CloneFactory {
    address public implementation;

    mapping(address => address[]) ownerToMeeseeks;

    event NewMrMeeseeks(address indexed _owner, string _purpose, uint256 _createdAt, address _location);

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function summonMrMeeseeks(string calldata _purpose) external returns (address) {
        string memory purpose;
        address[] memory meeseeks = ownerToMeeseeks[msg.sender];

        if (bytes(_purpose).length == 0) {
            if (meeseeks.length > 0) {
                uint256 size;
                address prevMeeseeks = meeseeks[meeseeks.length - 1];

                assembly {
                    size := extcodesize(prevMeeseeks)
                }

                if (size != 0) {
                    purpose = MrMeeseeks_Implementation(prevMeeseeks).purpose();
                } else noPurpose();

            } else noPurpose();
        } else purpose = _purpose;

        address newMeeseeks;

        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            let impl := sload(implementation.slot)
            mstore(add(ptr, 0x14), shl(0x60, impl))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            newMeeseeks := create(0, ptr, 0x37)
        }
        require(newMeeseeks != address(0), "ERC1167: create failed");

        MrMeeseeks_Implementation(newMeeseeks).initialize(_purpose, msg.sender);

        ownerToMeeseeks[msg.sender].push(newMeeseeks);

        emit NewMrMeeseeks(msg.sender, purpose, block.timestamp, newMeeseeks);

        return newMeeseeks;
    }

    // Creating this function to revert a transaction takes 0.039 KiB
    // less size than calling `revert('Provide a purpose')` twice.
    // It's a LOT, RIGHT?! :D
    function noPurpose() pure private {
        revert("Provide a purpose");
    }

    function getLastMeeseeks() external view returns(address) {
        address[] memory meeseeks = ownerToMeeseeks[msg.sender];
        return meeseeks[meeseeks.length - 1];
    }

    function getAllMeeseeks() external view returns(address[] memory) {
        return ownerToMeeseeks[msg.sender];
    }
}