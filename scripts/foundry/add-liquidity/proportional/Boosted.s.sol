//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { console } from "forge-std/console.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Setup } from "../Setup.sol";
import { IPermit2 } from "@permit2/interfaces/IPermit2.sol";
import { ICompositeLiquidityRouter } from "@balancer-labs/v3-interfaces/contracts/vault/ICompositeLiquidityRouter.sol";

// forge script scripts/foundry/add-liquidity/proportional/Boosted.s.sol --fork-url mainnet
contract Boosted is Setup {
    function run() public {
        setupTokenBalances();

        uint256[] memory maxAmountsIn = new uint256[](2);
        maxAmountsIn[0] = 10e18; // wETH
        maxAmountsIn[1] = 10e18; // wstETH

        bool[] memory wrapUnderlying = new bool[](2);
        wrapUnderlying[0] = true; // wrap wETH into waEthLidowETH
        wrapUnderlying[1] = true; // wrap wstETH into waEthLidowstETH

        // Approve permit2 contract on token
        IERC20(wETH).approve(permit2, maxAmountsIn[0]);
        IERC20(wstETH).approve(permit2, maxAmountsIn[1]);
        // Approve compositeRouter on Permit2
        IPermit2(permit2).approve(wETH, compositeRouter, type(uint160).max, type(uint48).max);
        IPermit2(permit2).approve(wstETH, compositeRouter, type(uint160).max, type(uint48).max);

        (address[] memory tokensIn, uint256[] memory amountsIn) = ICompositeLiquidityRouter(compositeRouter)
            .addLiquidityProportionalToERC4626Pool(
                0xc4Ce391d82D164c166dF9c8336DDF84206b2F812, // Aave Lido wETH-wstETH pool
                wrapUnderlying,
                maxAmountsIn,
                0.001e18, // exactBptAmountOut
                false, // wethIsEth
                "" // userData
            );
        console.log("Tokens in[0]: %s", tokensIn[0]);
        console.log("Tokens in[1]: %s", tokensIn[1]);
        console.log("Amounts in[0]: %s", amountsIn[0]);
        console.log("Amounts in[1]: %s", amountsIn[1]);
    }
}
