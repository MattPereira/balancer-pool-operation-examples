//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Setup } from "./utils/Setup.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";
import { IRouter } from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/IRouter.sol";

// forge script scripts/foundry/AddLiquidityProportional.s.sol --fork-url mainnet
contract AddLiquidityProportional is Setup {
    function run() public {
        setupTokenBalances();

        // Approve permit2 contract on token
        IERC20(waEthLidowETH).approve(permit2, type(uint256).max);
        IERC20(waEthLidowstETH).approve(permit2, maxAmountsIn[1]);
        // Approve compositeRouter on Permit2
        IPermit2(permit2).approve(waEthLidowETH, router, type(uint160).max, type(uint48).max);
        IPermit2(permit2).approve(waEthLidowstETH, router, type(uint160).max, type(uint48).max);

        uint256[] memory amountsIn = IRouter(router).addLiquidityProportional(
            0xc4Ce391d82D164c166dF9c8336DDF84206b2F812, // Aave Lido wETH-wstETH pool
            [10e18, 10e18], // maxAmountsIn for [waEthLidowETH, waEthLidowstETH]
            1e18, // exactBptAmountOut
            false, // wethIsEth
            "" // userData
        );
        console.log("Amounts in[0]: %s", amountsIn[0]);
        console.log("Amounts in[1]: %s", amountsIn[1]);
    }
}
