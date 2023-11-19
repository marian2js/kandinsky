// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction, SafeRootAccess} from "@safe/DataTypes.sol";

/**
 * @title Dead Man's Switch Plugin - A contract compatible with Safe{Core} Protocol that adds a new owner to a Safe account after prolonged period of inactivity.
 * @notice This contract should be listed in a Registry and enabled as a Plugin for an account through a Manager to be able to intiate recovery mechanism.
 * @dev The dead man's switch is activated permissionlessly. Once activated, the Safe account owner has a fixed timeline within which the switch can be nullified.
 *      Past the nullification deadline, another permisionless call is made to finalize the switch.
 * @author SJ - @web3dotsj
 */
contract DMSPlugin is BasePluginWithEventMetadata {

    mapping(address => bool) public activated;
    mapping(address => uint256) public duration; // in seconds
    mapping(address => uint256) public finalityTimestamp;
    mapping(address => address) public newOwner;

    event SwitchActivated(address indexed safe, address activator, uint256 finalityTimestamp);
    event SwitchNullified(address indexed safe);
    event SwitchFinalized(address indexed safe, address finalizer);
    event DurationSet(address indexed safe, uint256 duration);
    event NewOwnerSet(address indexed safe, address newOwner);

    function activate(ISafe safe) external {
        require(!activated[address(safe)], "Dead man's switch already activated");
        require(newOwner[address(safe)] != address(0), "New owner not set");

        activated[address(safe)] = true;
        if(duration[address(safe)]==0) {
            duration[address(safe)] = 86400*365; // Default: 365 days
        }
        finalityTimestamp[address(safe)] = block.timestamp + duration;
        

        emit SwitchActivated(address(safe), msg.sender, block.timestamp + duration);
    }

    function nullify() external {
        require(activated[msg.sender], "Dead man's switch not activated");
        require(block.timestamp <= finalityTimestamp[msg.sender], "Dead man's switch past cooldown period");

        delete activated[msg.sender];
        delete finalityTimestamp[msg.sender];
        emit SwitchNullified(msg.sender);
    }

    function setOwnerAndDuration(address _newOwner, uint256 timeInSeconds) external {
        require(_newOwner != address(0), "New owner cannot be zero address");
        newOwner[msg.sender] = _newOwner;
        duration[msg.sender] = timeInSeconds;
        emit DurationSet(msg.sender, timeInSeconds);
        emit NewOwnerSet(msg.sender, _newOwner);
    }

    constructor(
    )
        BasePluginWithEventMetadata(
            PluginMetadata({name: "Dead Man's Switch Plugin", version: "1.0.0", requiresRootAccess: false, iconUrl: "", appUrl: ""})
        )
    {
    }

    function executeFromPlugin(
        ISafeProtocolManager manager,
        ISafe safe
    ) external returns (bytes memory data) {
        require(activated[address(safe)] && block.timestamp > finalityTimestamp[address(safe)], "Minimum requirements not fulfiled");

        bytes memory txData = abi.encodeWithSignature("addOwnerWithThreshold(address,uint256)", newOwner[address(safe)], 1);

        SafeProtocolAction memory safeProtocolAction = SafeProtocolAction(payable(address(safe)), 0, txData);
        SafeRootAccess memory safeTx = SafeRootAccess(safeProtocolAction, 0, "");
        (data) = manager.executeRootAccess(safe, safeTx);

        if (data.length > 0) {
            // Clear states after successful ownership transfer
            delete activated[address(safe)];
            delete duration[address(safe)]; 
            delete finalityTimestamp[address(safe)];
            delete newOwner[address(safe)];

        }
        emit SwitchFinalized(address(safe), msg.sender);
    }
}