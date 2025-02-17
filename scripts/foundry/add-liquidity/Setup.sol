//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script } from "forge-std/Script.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import { AddressRegistry } from "../utils/AddressRegistry.sol";

interface IWETH {
    function deposit() external payable;
}

contract Setup is Script, AddressRegistry {
    address internal alice = makeAddr("alice");

    function setupTokenBalances() public {
        vm.startPrank(alice);
        vm.deal(alice, 1000 ether);
        IWETH(wETH).deposit{ value: 100 ether }();
        IERC20(wETH).approve(address(waEthLidowETH), 100 ether);
        IERC4626(waEthLidowETH).deposit(10 ether, alice);
    }
}
