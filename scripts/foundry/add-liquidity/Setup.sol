//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import { AddressRegistry } from "../utils/AddressRegistry.sol";
import { ICompositeLiquidityRouter } from "@balancer-labs/v3-interfaces/contracts/vault/ICompositeLiquidityRouter.sol";
import { IPermit2 } from "@permit2/interfaces/IPermit2.sol";

interface IWETH {
    function deposit() external payable;
}

contract Setup is Script, AddressRegistry {
    address internal alice = makeAddr("alice");

    function setupTokenBalances() public {
        // 1. Deal alice some ETH
        vm.startPrank(alice);
        vm.deal(alice, 100000e18);

        // 2. Deposit ETH into wETH
        IWETH(wETH).deposit{ value: 10000e18 }();

        // 3. Use wETH to join the Aave Lido wETH-wstETH pool
        IERC20(wETH).approve(permit2, type(uint256).max);
        IPermit2(permit2).approve(wETH, compositeRouter, type(uint160).max, type(uint48).max);

        bool[] memory wrapUnderlying = new bool[](2);
        wrapUnderlying[0] = true;
        wrapUnderlying[1] = false;

        uint256[] memory amountsIn = new uint256[](2);
        amountsIn[0] = 1000e18;
        amountsIn[1] = 0;

        ICompositeLiquidityRouter(compositeRouter).addLiquidityUnbalancedToERC4626Pool(
            aaveLidowETHwstETHPool,
            wrapUnderlying,
            amountsIn,
            0, // minBptAmountOut
            false, // wethIsEth
            "" // userData
        );

        // 4. Proportionally remove waEthLidowETH and waEthLidowstETH from the pool
        bool[] memory unwrapWrapped = new bool[](2);
        unwrapWrapped[0] = false;
        unwrapWrapped[1] = false;

        uint256 exactBptAmountIn = 888e18;

        uint256[] memory minAmountsOut = new uint256[](2);
        minAmountsOut[0] = 0;
        minAmountsOut[1] = 0;

        IERC20(aaveLidowETHwstETHPool).approve(compositeRouter, type(uint256).max);

        ICompositeLiquidityRouter(compositeRouter).removeLiquidityProportionalFromERC4626Pool(
            aaveLidowETHwstETHPool,
            unwrapWrapped,
            exactBptAmountIn, // exactBptAmountIn,
            minAmountsOut,
            false, // wethIsEth
            ""
        );

        // 5. Withdraw from waEthLidowstETH to get wstETH
        IERC4626(waEthLidowstETH).withdraw(20e18, alice, alice);

        // console.log("wETH balance: %s", IERC20(wETH).balanceOf(alice));
        // console.log("waEthLidowETH balance: %s", IERC20(waEthLidowETH).balanceOf(alice));
        // console.log("wstETH balance: %s", IERC20(wstETH).balanceOf(alice));
        // console.log("waEthLidowstETH balance: %s", IERC20(waEthLidowstETH).balanceOf(alice));
        // console.log("aaveLidowETHwstETHPool balance: %s", IERC20(aaveLidowETHwstETHPool).balanceOf(alice));
    }
}
