//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IRouter } from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/IRouter.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";
import { Setup } from "../utils/Setup.sol";

// forge script scripts/foundry/RemoveLiquiditySingleTokenExactOut.s.sol --fork-url mainnet
contract RemoveLiquiditySingleTokenExactOut is Setup {
    function run() public {
        setupTokenBalances();

        // Approve router on BPT
        IERC20(aaveLidowETHwstETHPool).approve(router, type(uint256).max);

        uint256 bptAmountIn = IRouter(router).removeLiquiditySingleTokenExactOut(
            aaveLidowETHwstETHPool,
            100e18, // maxBptAmountIn,
            IERC20(waEthLidowETH), // tokenOut
            1e18, // exactAmountOut
            false, // wethIsEth
            "" // userData
        );

        console.log("BPT amount in: %s", bptAmountIn);
    }
}
