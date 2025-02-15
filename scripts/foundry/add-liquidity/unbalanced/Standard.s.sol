//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { console } from "forge-std/Script.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Setup } from "../Setup.sol";
import { IPermit2 } from "@permit2/interfaces/IPermit2.sol";
import { IRouter } from "@balancer-labs/v3-interfaces/contracts/vault/IRouter.sol";

/**
 * @dev forge script scripts/foundry/add-liquidity/unbalanced/Standard.s.sol --fork-url mainnet
 */
contract Standard is Setup {
    function run() public {
        setupTokenBalances();

        uint256[] memory amountsIn = new uint256[](2);
        amountsIn[0] = 1e18; // waEthLidoWETH
        amountsIn[1] = 0; // waEthLidowstETH

        // Approve permit2 contract on token
        IERC20(waEthLidoWETH).approve(permit2, amountsIn[0]);
        // Approve compositeRouter on Permit2
        IPermit2(permit2).approve(waEthLidoWETH, router, type(uint160).max, type(uint48).max);

        uint256 bptAmountOut = IRouter(router).addLiquidityUnbalanced(
            0xc4Ce391d82D164c166dF9c8336DDF84206b2F812, // Aave Lido wETH-wstETH pool
            amountsIn,
            0, // minBptAmountOut
            false, // wethIsEth
            "" // userData
        );
        console.log("BPT amount out: %s", bptAmountOut);
    }
}
