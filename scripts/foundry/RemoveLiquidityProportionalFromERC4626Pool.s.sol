//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    ICompositeLiquidityRouter
} from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/ICompositeLiquidityRouter.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";
import { Setup } from "./utils/Setup.sol";

// forge script scripts/foundry/RemoveLiquidityProportionalFromERC4626Pool.s.sol --fork-url mainnet
contract RemoveLiquidityProportionalFromERC4626Pool is Setup {
    function run() public {
        setupTokenBalances();

        // Approve compositeRouter on BPT
        IERC20(aaveLidowETHwstETHPool).approve(compositeRouter, type(uint256).max);

        bool[] memory unwrapWrapped = new bool[](2);
        unwrapWrapped[0] = false;
        unwrapWrapped[1] = false;

        uint256[] memory minAmountsOut = new uint256[](2);
        minAmountsOut[0] = 0;
        minAmountsOut[1] = 0;

        (address[] memory tokensOut, uint256[] memory amountsOut) = ICompositeLiquidityRouter(compositeRouter)
            .removeLiquidityProportionalFromERC4626Pool(
                aaveLidowETHwstETHPool,
                unwrapWrapped,
                1e18, // exactBptAmountIn,
                minAmountsOut,
                false, // wethIsEth
                ""
            );
        console.log("Tokens out[0]: %s", tokensOut[0]);
        console.log("Tokens out[1]: %s", tokensOut[1]);
        console.log("Amounts out[0]: %s", amountsOut[0]);
        console.log("Amounts out[1]: %s", amountsOut[1]);
    }
}
