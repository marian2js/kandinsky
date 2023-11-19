// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {RecoveryPlugin} from "../src/RecoveryPlugin.sol";
import {DMSPlugin} from "../src/DMSPlugin.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        new RecoveryPlugin();
        new DMSPlugin();
        vm.stopBroadcast();
    }
}
