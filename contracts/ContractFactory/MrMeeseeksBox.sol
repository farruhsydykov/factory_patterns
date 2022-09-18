// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./MrMeeseeks.sol";

contract MrMeeseeksBox {
    mapping(address => address[]) public ownerToMeeseeks;

    event NewMrMeeseeks(address indexed _owner, string _purpose, uint256 _createdAt, address _location);

    function summonMrMeeseeks(string calldata _purpose) external returns (address) {
        string memory purpose;
        address[] memory meeseeks = ownerToMeeseeks[msg.sender];

        if (bytes(_purpose).length == 0) {
            if (meeseeks.length > 0) {
                try MrMeeseeks(meeseeks[meeseeks.length - 1]).purpose() returns (string memory prevPurpose) {
                    purpose = prevPurpose;
                } catch  {
                    noPurpose();
                }
            } else noPurpose();
        } else purpose = _purpose;

        address newMeeseeks = address(new MrMeeseeks(purpose, msg.sender));
        ownerToMeeseeks[msg.sender].push(newMeeseeks);

        emit NewMrMeeseeks(msg.sender, purpose, block.timestamp, newMeeseeks);

        return newMeeseeks;
    }

    // Creating this function to revert a transaction takes 0.039 KiB
    // less size than calling `revert('Provide a purpose')` twice.
    // It's a LOT, RIGHT?! :D
    function noPurpose() pure private {
        revert('Provide a purpose');
    }
}