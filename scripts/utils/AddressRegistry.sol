// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AddressRegistry {
    ////// ALL CHAINS //////
    address internal permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    ////// MAINNET //////
    // tokens
    address internal wETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address internal waEthLidoWETH = 0x0FE906e030a44eF24CA8c7dC7B7c53A6C4F00ce9;
    // balancer v3
    address internal router = 0x5C6fb490BDFD3246EB0bB062c168DeCAF4bD9FDd;
    address internal compositeRouter = 0xb21A277466e7dB6934556a1Ce12eb3F032815c8A;
    address internal Aave_Lido_wETH_wstETH_Pool = 0xc4Ce391d82D164c166dF9c8336DDF84206b2F812;
}
