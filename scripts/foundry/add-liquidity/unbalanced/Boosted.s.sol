//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { console } from "forge-std/console.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Setup } from "../Setup.sol";
import { IPermit2 } from "@permit2/interfaces/IPermit2.sol";
import { ICompositeLiquidityRouter } from "@balancer-labs/v3-interfaces/contracts/vault/ICompositeLiquidityRouter.sol";

// forge script scripts/foundry/add-liquidity/unbalanced/Boosted.s.sol --fork-url mainnet
contract Boosted is Setup {
    function run() public {
        setupTokenBalances();

        bool[] memory wrapUnderlying = new bool[](2);
        wrapUnderlying[0] = true; // wrap wETH into waEthLidowETH
        wrapUnderlying[1] = false;

        uint256[] memory exactAmountsIn = new uint256[](2);
        exactAmountsIn[0] = 1e18; // waEthLidowETH
        exactAmountsIn[1] = 0; // waEthLidowstETH

        // Approve permit2 contract on token
        IERC20(wETH).approve(permit2, exactAmountsIn[0]);
        // Approve compositeRouter on Permit2
        IPermit2(permit2).approve(wETH, compositeRouter, type(uint160).max, type(uint48).max);

        uint256 bptAmountOut = ICompositeLiquidityRouter(compositeRouter).addLiquidityUnbalancedToERC4626Pool(
            0xc4Ce391d82D164c166dF9c8336DDF84206b2F812, // Aave Lido wETH-wstETH pool
            wrapUnderlying,
            exactAmountsIn,
            0, // minBptAmountOut
            false, // wethIsEth
            "" // userData
        );
        console.log("BPT amount out: %s", bptAmountOut);
    }
}
