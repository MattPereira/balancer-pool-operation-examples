//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    ICompositeLiquidityRouter
} from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/ICompositeLiquidityRouter.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";
import { Setup } from "../utils/Setup.sol";

// forge script scripts/foundry/AddLiquidityUnbalancedToERC4626Pool.s.sol --fork-url mainnet
contract AddLiquidityUnbalancedToERC4626Pool is Setup {
    function run() public {
        setupTokenBalances();

        // Approve permit2 contract on token
        IERC20(wETH).approve(permit2, exactAmountsIn[0]);
        // Approve compositeRouter on Permit2
        IPermit2(permit2).approve(wETH, compositeRouter, type(uint160).max, type(uint48).max);

        bool[] memory wrapUnderlying = new bool[](2);
        wrapUnderlying[0] = true; // wrap wETH into waEthLidowETH
        wrapUnderlying[1] = false;

        uint256[] memory exactAmountsIn = new uint256[](2);
        exactAmountsIn[0] = 1e18; // waEthLidowETH
        exactAmountsIn[1] = 0; // waEthLidowstETH

        uint256 bptAmountOut = ICompositeLiquidityRouter(compositeRouter).addLiquidityUnbalancedToERC4626Pool(
            aaveLidowETHwstETHPool, // pool
            wrapUnderlying,
            exactAmountsIn,
            0, // minBptAmountOut
            false, // wethIsEth
            "" // userData
        );
        console.log("BPT amount out: %s", bptAmountOut);
    }
}
