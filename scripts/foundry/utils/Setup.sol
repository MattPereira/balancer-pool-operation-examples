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

interface IwETH {
    function deposit() external payable;
}

interface IstETH {
    function submit(address _referral) external payable returns (uint256);
}

interface IwstETH {
    function wrap(uint256 _stETHAmount) external returns (uint256);
}

/**
 * Before a script runs, give _alice balances for:
 * - wETH (underlying token 1)
 * - waEthLidowETH (pool token 1)
 * - wstETH (underlying token 2)
 * - waEthLidowstETH (pool token 2)
 * - aaveLidowETHwstETHPool (BPT)
 */
contract Setup is Script, AddressRegistry {
    address internal _alice = makeAddr("alice");

    function setupTokenBalances() public {
        vm.startPrank(_alice);
        vm.deal(_alice, 100000e18);

        getUnderlyingTokenBalances();
        getPoolTokenBalances();
        getBptBalance();

        logTokenBalances();
    }

    // get wETH and wstETH
    function getUnderlyingTokenBalances() public {
        IwETH(wETH).deposit{ value: 10000e18 }(); // get wETH

        IstETH(stETH).submit{ value: 10000e18 }(_alice); // get stETH

        IERC20(stETH).approve(wstETH, type(uint256).max);
        IwstETH(wstETH).wrap(10000e18); // get wstETH
    }

    // get waEthLidowETH and waEthLidowstETH
    function getPoolTokenBalances() public {
        IERC20(wETH).approve(waEthLidowETH, type(uint256).max);
        IERC20(wstETH).approve(waEthLidowstETH, type(uint256).max);

        IERC4626(waEthLidowETH).deposit(5000e18, _alice);
        IERC4626(waEthLidowstETH).deposit(5000e18, _alice);
    }

    // get BPT for aaveLidowETHwstETHPool
    function getBptBalance() public {
        IERC20(wETH).approve(permit2, type(uint256).max);
        IERC20(wstETH).approve(permit2, type(uint256).max);
        IPermit2(permit2).approve(wETH, compositeRouter, type(uint160).max, type(uint48).max);
        IPermit2(permit2).approve(wstETH, compositeRouter, type(uint160).max, type(uint48).max);

        bool[] memory wrapUnderlying = new bool[](2);
        wrapUnderlying[0] = true; // wrap wETH into waEthLidowETH
        wrapUnderlying[1] = true; // wrap wstETH into waEthLidowstETH

        uint256[] memory maxAmountsIn = new uint256[](2);
        maxAmountsIn[0] = 100e18; // wETH
        maxAmountsIn[1] = 100e18; // wstETH

        ICompositeLiquidityRouter(compositeRouter).addLiquidityProportionalToERC4626Pool(
            aaveLidowETHwstETHPool, // pool
            wrapUnderlying,
            maxAmountsIn,
            5e18, // exactBptAmountOut
            false, // wethIsEth
            "" // userData
        );
    }

    function logTokenBalances() public view {
        console.log("wETH balance: %s", IERC20(wETH).balanceOf(_alice));
        console.log("waEthLidowETH balance: %s", IERC20(waEthLidowETH).balanceOf(_alice));
        console.log("wstETH balance: %s", IERC20(wstETH).balanceOf(_alice));
        console.log("waEthLidowstETH balance: %s", IERC20(waEthLidowstETH).balanceOf(_alice));
        console.log("aaveLidowETHwstETHPool balance: %s", IERC20(aaveLidowETHwstETHPool).balanceOf(_alice));
    }
}
