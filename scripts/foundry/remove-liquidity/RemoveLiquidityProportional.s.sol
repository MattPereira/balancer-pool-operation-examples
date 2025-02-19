//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IRouter } from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/IRouter.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";
import { Setup } from "../utils/Setup.sol";

// forge script scripts/foundry/remove-liquidity/RemoveLiquidityProportional.s.sol --fork-url mainnet
contract RemoveLiquidityProportional is Setup {
    function run() public {
        setupTokenBalances();

        // Approve router on BPT
        IERC20(aaveLidowETHwstETHPool).approve(router, type(uint256).max);

        uint256[] memory minAmountsOut = new uint256[](2);
        minAmountsOut[0] = 0;
        minAmountsOut[1] = 0;

        uint256[] memory amountsOut = IRouter(router).removeLiquidityProportional(
            aaveLidowETHwstETHPool, // pool
            1e18, // exactBptAmountIn,
            minAmountsOut,
            false, // wethIsEth
            "" // userData
        );

        console.log("Amounts out[0]: %s", amountsOut[0]);
        console.log("Amounts out[1]: %s", amountsOut[1]);
    }
}
