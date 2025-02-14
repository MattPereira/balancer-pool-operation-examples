//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Helpers} from "../utils/Helpers.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {IRouter} from "@balancer-labs/v3-interfaces/contracts/vault/IRouter.sol";

interface IWETH {
    function deposit() external payable;
}

contract SetupAddLiquidity is Script {
    IRouter router = IRouter(0x5C6fb490BDFD3246EB0bB062c168DeCAF4bD9FDd); // Mainnet

    address alice = makeAddr("alice");

    address wETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address waEthLidoWETH = 0x0FE906e030a44eF24CA8c7dC7B7c53A6C4F00ce9;

    function setupAddLiquidity() public {
        // setup token balance for waEthLidoWETH
        vm.startPrank(alice);
        vm.deal(alice, 1000 ether);
        IWETH(wETH).deposit{value: 100 ether}();
        IERC20(wETH).approve(address(waEthLidoWETH), 100 ether);
        IERC4626(waEthLidoWETH).deposit(10 ether, alice);

        console.log(
            "waEthLidoWETH balance of alice: %s",
            IERC20(waEthLidoWETH).balanceOf(alice)
        );
    }
}
