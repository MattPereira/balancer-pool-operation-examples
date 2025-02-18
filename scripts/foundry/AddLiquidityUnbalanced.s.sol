//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Setup } from "./utils/Setup.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";
import { IRouter } from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/IRouter.sol";

// forge script scripts/foundry/AddLiquidityUnbalanced.s.sol --fork-url mainnet
contract AddLiquidityUnbalanced is Setup {
    function run() public {
        setupTokenBalances();

        // Approve permit2 contract on token
        IERC20(waEthLidowETH).approve(permit2, amountsIn[0]);
        // Approve router on Permit2
        IPermit2(permit2).approve(waEthLidowETH, router, type(uint160).max, type(uint48).max);

        uint256[] memory amountsIn = new uint256[](2);
        amountsIn[0] = 1e18; // waEthLidowETH
        amountsIn[1] = 0; // waEthLidowstETH

        uint256 bptAmountOut = IRouter(router).addLiquidityUnbalanced(
            aaveLidowETHwstETHPool, // pool
            amountsIn,
            0, // minBptAmountOut
            false, // wethIsEth
            "" // userData
        );
        console.log("BPT amount out: %s", bptAmountOut);
    }
}
