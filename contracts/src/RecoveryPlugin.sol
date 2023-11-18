// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction, SafeRootAccess} from "@safe/DataTypes.sol";

/**
 * @title Recovery Plugin - A contract compatible with Safe{Core} Protocol that adds a new owner to a Safe account in the event of an emergency.
 * @notice This contract should be listed in a Registry and enabled as a Plugin for an account through a Manager to be able to intiate recovery mechanism.
 * @dev The recovery process is initiated by a list of recoverer accounts. The recoverers are set by the Safe account owner.
 *      The recoverers can initiate the recovery process through a voting-based system. Once the voting threshold is crossed, any of the recoverer accounts can execute and
 *      complete the recovery process by calling the executeFromPlugin function.
 * @author SJ - @web3dotsj
 */
contract RecoveryPlugin is BasePluginWithEventMetadata {
    mapping(address => address[]) public recoverers;
    mapping(address => mapping(address => bool)) public isRecoverer;
    mapping(address => uint256) public minNumVotes;

    mapping(address => address[]) public voters;
    mapping(address => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) numVotes;

    function addRecoverers(address[] calldata _recoverers) external {
        for (uint256 i = 0; i < _recoverers.length; i++) {
            recoverers[msg.sender].push(_recoverers[i]);
            isRecoverer[msg.sender][_recoverers[i]] = true;
        }

        if (minNumVotes[msg.sender] == 0) {
            minNumVotes[msg.sender] = 1;
        }
    }

    function addRecoverer(address recoverer) external {
        recoverers[msg.sender].push(recoverer);
        isRecoverer[msg.sender][recoverer] = true;

        if (minNumVotes[msg.sender] == 0) {
            minNumVotes[msg.sender] = 1;
        }
    }

    function removeRecoverer(address recoverer) external {
        require(isRecoverer[msg.sender][recoverer], "Recoverer does not exist");
        uint256 index = 0;
        for (uint256 i = 0; i < recoverers[msg.sender].length; i++) {
            if (recoverers[msg.sender][i] == recoverer) {
                index = i;
                break;
            }
        }

        for (uint256 i = index; i < recoverers[msg.sender].length - 1; i++) {
            recoverers[msg.sender][i] = recoverers[msg.sender][i + 1];
        }
        recoverers[msg.sender].pop();
        isRecoverer[msg.sender][recoverer] = false;
    }

    function vote(address safe) external {
        require(!hasVoted[safe][msg.sender], "Caller has already voted");
        voters[safe].push(msg.sender);
        hasVoted[safe][msg.sender] = true;
        numVotes[safe]++;
    }

    function changeMinimumVotes(uint256 num) external {
        require(num > 0, "Invalid vote count");
        minNumVotes[msg.sender] = num;
    }

    // Events
    event OwnerAdded(address indexed account, address newOwner);

    constructor()
        BasePluginWithEventMetadata(
            PluginMetadata({name: "Recovery Plugin", version: "1.0.0", requiresRootAccess: true, iconUrl: "", appUrl: ""})
        )
    {}

    function executeFromPlugin(ISafeProtocolManager manager, ISafe safe, address newOwner)
        external
        returns (bytes memory data)
    {
        require(isRecoverer[address(safe)][msg.sender], "Caller is not recoverer");
        require(
            minNumVotes[address(safe)] > 0 && numVotes[address(safe)] >= minNumVotes[address(safe)],
            "Insufficient votes"
        );

        bytes memory txData = abi.encodeWithSignature("addOwnerWithThreshold(address,uint256)", newOwner, 1);

        SafeProtocolAction memory safeProtocolAction = SafeProtocolAction(payable(address(safe)), 0, txData);
        SafeRootAccess memory safeTx = SafeRootAccess(safeProtocolAction, 0, "");
        (data) = manager.executeRootAccess(safe, safeTx);

        if (data.length > 0) {
            // Clear states after successful ownership transfer
            for (uint256 i = 0; i < recoverers[address(safe)].length; i++) {
                address account = recoverers[address(safe)][i];
                isRecoverer[address(safe)][account] = false;
            }

            for (uint256 i = 0; i < voters[address(safe)].length; i++) {
                address account = voters[address(safe)][i];
                hasVoted[address(safe)][account] = false;
            }

            delete recoverers[address(safe)];
            delete voters[address(safe)];
            delete minNumVotes[address(safe)];
            delete numVotes[address(safe)];
        }
        emit OwnerAdded(address(safe), newOwner);
    }
}
