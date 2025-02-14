//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Helpers} from "../utils/Helpers.sol";
import {SetupAddLiquidity} from "../SetupAddLiquidity.sol";

/**
 * Unbalanced add some waEthLidoWETH to the pool
 *
 * https://balancer.fi/pools/ethereum/v3/0xc4ce391d82d164c166df9c8336ddf84206b2f812
 */
contract AddLiquidityStandard is SetupAddLiquidity, Helpers {
    function run() public {
        setupAddLiquidity();

        // token approval for the permit2 contract
        approveOnToken(waEthLidoWETH, permit2);
        // permit2 approval for the router contract
        approveOnPermit2(waEthLidoWETH, address(router));

        address pool = 0xc4Ce391d82D164c166dF9c8336DDF84206b2F812;
        uint256[] memory amountsIn = new uint256[](2);
        amountsIn[0] = 1e18; // waEthLidoWETH
        amountsIn[1] = 0; // waEthLidowstETH
        uint256 minBptAmountOut = 0;
        bool wethIsEth = false;
        bytes memory userData = "";

        // add liquidity
        uint256 bptAmountOut = router.addLiquidityUnbalanced(
            pool,
            amountsIn,
            minBptAmountOut,
            wethIsEth,
            userData
        );

        console.log("BPT amount out: %s", bptAmountOut);
    }
}
