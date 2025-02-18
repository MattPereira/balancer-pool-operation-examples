//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IRouter } from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/IRouter.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";
import { Setup } from "./utils/Setup.sol";

// forge script scripts/foundry/SwapSingleTokenExactIn.s.sol --fork-url mainnet
contract SwapSingleTokenExactIn is Setup {
    function run() public {
        setupTokenBalances();

        // Approve permit2 contract on token
        IERC20(waEthLidowETH).approve(permit2, type(uint256).max);
        // Approve router on Permit2
        IPermit2(permit2).approve(waEthLidowETH, router, type(uint160).max, type(uint48).max);

        uint256 amountOut = IRouter(router).swapSingleTokenExactIn(
            aaveLidowETHwstETHPool, // pool
            IERC20(waEthLidowETH), // tokenIn
            IERC20(waEthLidowstETH), // tokenOut
            1e18, // exactAmountIn
            1, // minAmountOut
            999999999999999999, // deadline
            false, // wethIsEth
            "" // userData
        );

        console.log("Amount out: %s", amountOut);
    }
}
