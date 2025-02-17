//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { console } from "forge-std/Script.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Setup } from "../Setup.sol";
import { IPermit2 } from "@permit2/interfaces/IPermit2.sol";
import { IRouter } from "@balancer-labs/v3-interfaces/contracts/vault/IRouter.sol";

/**
 * @dev forge script scripts/foundry/add-liquidity/proportional/Standard.s.sol --fork-url mainnet
 */
contract Boosted is Setup {
    function run() public {
        setupTokenBalances();

        uint256[] memory maxAmountsIn = new uint256[](2);
        maxAmountsIn[0] = 10e18; // wETH
        maxAmountsIn[1] = 10e18; // ??? what is underlying for wstETH?

        // Approve permit2 contract on token
        IERC20(wETH).approve(permit2, maxAmountsIn[0]);
        IERC20(???).approve(permit2, maxAmountsIn[1]);
        // Approve compositeRouter on Permit2
        IPermit2(permit2).approve(wETH, router, type(uint160).max, type(uint48).max);
        IPermit2(permit2).approve(???, router, type(uint160).max, type(uint48).max);

        uint256[] memory amountsIn = IRouter(router).addLiquidityProportional(
            0xc4Ce391d82D164c166dF9c8336DDF84206b2F812, // Aave Lido wETH-wstETH pool
            maxAmountsIn,
            1e18, // exactBptAmountOut
            false, // wethIsEth
            "" // userData
        );
        // console.log("Amounts in: %s", amountsIn);
    }
}
