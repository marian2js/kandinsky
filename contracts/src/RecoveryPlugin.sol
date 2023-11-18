// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {ISafe} from "@safe/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction, SafeRootAccess} from "@safe/DataTypes.sol";

/**
 * @title RecoveryWithDelayPlugin - A contract compatible with Safe{Core} Protocol that replaces a specified owner for a Safe by a non-owner account.
 * @notice This contract should be listed in a Registry and enabled as a Plugin for an account through a Manager to be able to intiate recovery mechanism.
 * @dev The recovery process is initiated by a recoverer account. The recoverer account is set during the contract deployment in the constructor and cannot be updated.
 *      The recoverer account can initiate the recovery process by calling the createAnnouncement function and later when the delay is over, any account can execute
 *      complete the recovery process by calling the executeFromPlugin function.
 * @author Akshay Patel - @akshay-ap
 */
contract RecoveryWithDelayPlugin is BasePluginWithEventMetadata {

    mapping(address => address[]) public recoverers;
    mapping(address => mapping(address=>bool)) public isRecoverer;
    mapping(address => uint256) public minNumVotes;

    mapping(address => address[]) public voters;
    mapping(address => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) numVotes;


    function addRecoverer(address recoverer) external {
        recoverers[msg.sender].push(recoverer);
        isRecoverer[msg.sender][recoverer] = true;
    }

    function vote(address safe) external {
       require(!hasVoted[safe][msg.sender], "Caller has already voted");
       voters[safe].push(msg.sender);
       hasVoted[safe][msg.sender] = true;
       numVotes[safe]++;
    }

    function removeRecoverer(address recoverer) external {
        require(isRecoverer[msg.sender][recoverer], "Recoverer does not exist");
        uint256 index = 0;
        for (uint256 i=0; i < array.length; i++) {
            if(recoverers[msg.sender][i]==recoverer) {
                index = i;
                break;
            }
        }

        for (uint256 i = index; i < array.length - 1; i++) {
            recoverers[msg.sender][i] = recoverers[msg.sender][i + 1];
        }
        array.pop();
        isRecoverer[msg.sender][recoverer] = false;

    }

    function changeMinimumVotes(uint256 num) external {
        require(num > 0, "Invalid vote count");
        minNumVotes[msg.sender] = num;
    }

    // Events
    event NewRecoveryAnnouncement(address indexed account, bytes32 txHash);
    event RecoveryAnnouncementCancelled(address indexed account, bytes32 txHash);
    event OwnerAdded(address indexed account, address newOwner);

    // Errors
    error CallerNotValidRecoverer();
    error TransactionAlreadyExecuted(bytes32 txHash);
    error TransactionAlreadyScheduled(bytes32 txHash);
    error ExecutionTimeShouldBeInFuture();
    error TransactionNotFound(bytes32 txHash);
    error TransactionExecutionNotAllowedYet(bytes32 txHash);
    error TransactionExecutionValidityExpired(bytes32 txHash);

    constructor(
    )
        BasePluginWithEventMetadata(
            PluginMetadata({name: "Recovery Plugin", version: "1.0.0", requiresRootAccess: true, iconUrl: "", appUrl: ""})
        )
    {
    }

    function executeFromPlugin(
        ISafeProtocolManager manager,
        ISafe safe,
        address newOwner
    ) external returns (bytes memory data) {
        require(isRecoverer[address(safe)][msg.sender], "Caller is not recoverer");
        require(minNumVotes[address(safe)] > 0 && numVotes[address(safe)] >= minNumVotes[address(safe)], "Insufficient votes");

        bytes memory txData = abi.encodeWithSignature("addOwnerWithThreshold(address,uint256)", newOwner, 1);

        SafeProtocolAction memory safeProtocolAction = SafeProtocolAction(payable(address(safe)), 0, txData);
        SafeRootAccess memory safeTx = SafeRootAccess(safeProtocolAction, 0, "");
        (data) = manager.executeRootAccess(safe, safeTx);

        if (data.length > 0) {
            // Clear states after successful ownership transfer
            for(uint256 i=0;i<recoverers[address(safe)].length;i++) {
                address account = recoverers[address(safe)][i];
                isRecoverer[address(safe)][account] = false;
            }

            for(uint256 i=0;i<voters[address(safe)].length;i++) {
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