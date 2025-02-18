//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    ICompositeLiquidityRouter
} from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/ICompositeLiquidityRouter.sol";
import { Script } from "lib/forge-std/src/Script.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IERC4626 } from "lib/openzeppelin-contracts/contracts/interfaces/IERC4626.sol";
import { AddressRegistry } from "./AddressRegistry.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";

interface IWETH {
    function deposit() external payable;
}

/**
 * Before a script runs, give _alice token balances for:
 * - wETH
 * - waEthLidowETH
 * - wstETH
 * - waEthLidowstETH
 * - aaveLidowETHwstETHPool
 */
contract Setup is Script, AddressRegistry {
    address internal _alice = makeAddr("alice");

    function setupTokenBalances() public {
        vm.startPrank(_alice);
        vm.deal(_alice, 100000e18);

        depositETHintoWETH(); // get wETH

        addLiquidityUnbalancedToERC4626Pool(); // get BPT

        removeLiquidityProportionalFromERC4626Pool(); // get waEthLidowETH and waEthLidowstETH

        withdrawFromWaEthLidowstETH(); // get wstETH

        // logTokenBalances();
    }

    // 1. Deposit ETH into wETH
    function depositETHintoWETH() public {
        IWETH(wETH).deposit{ value: 10000e18 }();
    }

    // 2. Use wETH to join the Aave Lido wETH-wstETH pool
    function addLiquidityUnbalancedToERC4626Pool() public {
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
    }

    // 3. Remove liquidity proportionally from the Aave Lido wETH-wstETH pool
    function removeLiquidityProportionalFromERC4626Pool() public {
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
    }

    // 4. Withdraw from waEthLidowstETH
    function withdrawFromWaEthLidowstETH() public {
        IERC4626(waEthLidowstETH).withdraw(20e18, _alice, _alice);
    }

    function logTokenBalances() public view {
        console.log("wETH balance: %s", IERC20(wETH).balanceOf(_alice));
        console.log("waEthLidowETH balance: %s", IERC20(waEthLidowETH).balanceOf(_alice));
        console.log("wstETH balance: %s", IERC20(wstETH).balanceOf(_alice));
        console.log("waEthLidowstETH balance: %s", IERC20(waEthLidowstETH).balanceOf(_alice));
        console.log("aaveLidowETHwstETHPool balance: %s", IERC20(aaveLidowETHwstETHPool).balanceOf(_alice));
    }
}
