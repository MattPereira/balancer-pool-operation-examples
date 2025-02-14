// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {IRouter} from "@balancer-labs/v3-interfaces/contracts/vault/IRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPermit2} from "permit2/src/interfaces/IPermit2.sol";
import {console, Script} from "forge-std/Script.sol";
import {IVault} from "@balancer-labs/v3-interfaces/contracts/vault/IVault.sol";

contract Helpers {
    address permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3; // same on all chains

    function approveOnToken(address token, address spender) internal {
        uint256 maxAmount = type(uint256).max;
        IERC20(token).approve(spender, maxAmount);
    }

    /**
     * @dev permit2 approval for the router contract
     */
    function approveOnPermit2(address token, address spender) internal {
        uint160 maxAmount = type(uint160).max;
        uint48 maxExpiration = type(uint48).max;
        IPermit2(permit2).approve(token, spender, maxAmount, maxExpiration);
    }
}
