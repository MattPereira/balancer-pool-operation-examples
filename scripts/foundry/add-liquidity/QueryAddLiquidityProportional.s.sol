//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Setup } from "../utils/Setup.sol";
import { console } from "lib/forge-std/src/console.sol";
import { IERC20 } from "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IPermit2 } from "lib/permit2/src/interfaces/IPermit2.sol";
import { IRouter } from "lib/balancer-v3-monorepo/pkg/interfaces/contracts/vault/IRouter.sol";

// forge script scripts/foundry/add-liquidity/QueryAddLiquidityProportional.s.sol --fork-url mainnet
contract QueryAddLiquidityProportional is Setup {
    function run() public {
        setupTokenBalances();

        vm.startPrank(_alice, address(0));

        uint256[] memory amountsIn = IRouter(router).queryAddLiquidityProportional(
            aaveLidowETHwstETHPool, // pool
            10e18, // exactBptAmountOut
            _alice, // sender
            "" // userData
        );
        console.log("Amounts in[0]: %s", amountsIn[0]);
        console.log("Amounts in[1]: %s", amountsIn[1]);
    }
}
