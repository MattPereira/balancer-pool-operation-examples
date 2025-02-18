//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    ICompositeLiquidityRouter
} from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/ICompositeLiquidityRouter.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { Setup } from "./utils/Setup.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";

// forge script scripts/foundry/AddLiquidityProportionalToERC4626Pool.s.sol --fork-url mainnet
contract AddLiquidityProportionalToERC4626Pool is Setup {
    function run() public {
        setupTokenBalances();

        // Approve permit2 contract on token
        IERC20(wETH).approve(permit2, type(uint256).max);
        IERC20(wstETH).approve(permit2, type(uint256).max);
        // Approve compositeRouter on Permit2
        IPermit2(permit2).approve(wETH, compositeRouter, type(uint160).max, type(uint48).max);
        IPermit2(permit2).approve(wstETH, compositeRouter, type(uint160).max, type(uint48).max);

        bool[] memory wrapUnderlying = new bool[](2);
        wrapUnderlying[0] = true; // wrap wETH into waEthLidowETH
        wrapUnderlying[1] = true; // wrap wstETH into waEthLidowstETH

        uint256[] memory maxAmountsIn = new uint256[](2);
        maxAmountsIn[0] = 10e18; // wETH
        maxAmountsIn[1] = 10e18; // wstETH

        (address[] memory tokensIn, uint256[] memory amountsIn) = ICompositeLiquidityRouter(compositeRouter)
            .addLiquidityProportionalToERC4626Pool(
                0xc4Ce391d82D164c166dF9c8336DDF84206b2F812, // Aave Lido wETH-wstETH pool
                wrapUnderlying, // wrapUnderlying for [wETH, wstETH]
                maxAmountsIn, // maxAmountsIn for [wETH, wstETH]
                0.1e18, // exactBptAmountOut
                false, // wethIsEth
                "" // userData
            );
        console.log("Tokens in[0]: %s", tokensIn[0]);
        console.log("Tokens in[1]: %s", tokensIn[1]);
        console.log("Amounts in[0]: %s", amountsIn[0]);
        console.log("Amounts in[1]: %s", amountsIn[1]);
    }
}
