# Pool Operation Examples

A collection of example scripts for Balancer v3 pool operations configured to run on a local fork of Ethereum mainnet.

## Environment Setup

1. Ensure you have the latest version of foundry installed

```
foundryup
```

2. Clone this repo & install dependencies

```
git clone https://github.com/MattPereira/balancer-pool-operation-examples.git
cd balancer-pool-operation-examples
pnpm install
```

3. Add a `MAINNET_RPC_URL` to a `.env` file

```
MAINNET_RPC_URL=
```

## Hardhat scripts

```
npx hardhat run scripts/hardhat/<path_to_script>
```

## Foundry scripts

```
forge script scripts/foundry/<path_to_script> --fork-url mainnet
```

## Add Liquidity

### Unbalanced

<table>
  <tr>
    <th>Typescript</th>
    <th>Solidity</th>
  </tr>
  <tr>
    <td><a href="scripts/hardhat/add-liquidity/addLiquidityUnbalanced.ts">addLiquidityUnbalanced.ts</a></td>
    <td><a href="scripts/foundry/add-liquidity/addLiquidityUnbalanced.s.sol">addLiquidityUnbalanced.s.sol</a></td>
  </tr>
  <tr>
    <td><a href="scripts/hardhat/add-liquidity/addLiquidityUnbalancedToERC4626.ts">addLiquidityUnbalancedToERC4626.ts</a></td>
    <td><a href="scripts/foundry/add-liquidity/addLiquidityUnbalancedToERC4626.s.sol">addLiquidityUnbalancedToERC4626.s.sol</a></td>
  </tr>
</table>

<table>
  <tr>
  <th>Typescript</th>
    <td><a href="scripts/hardhat/add-liquidity/addLiquidityUnbalanced.ts">addLiquidityUnbalanced.ts</a></td>
    <td><a href="scripts/hardhat/add-liquidity/addLiquidityUnbalancedToERC4626.ts">addLiquidityUnbalancedToERC4626.ts</a></td>

  </tr>
  <tr>
  <th>Solidity</th>
    <td><a href="scripts/foundry/add-liquidity/addLiquidityUnbalanced.s.sol">addLiquidityUnbalanced.s.sol</a></td>
    <td><a href="scripts/foundry/add-liquidity/addLiquidityUnbalancedToERC4626.s.sol">addLiquidityUnbalancedToERC4626.s.sol</a></td>
  </tr>
</table>

### Proportional

<table>
  <tr>
    <th>Typescript</th>
    <th>Solidity</th>
  </tr>
  <tr>
    <td><a href="scripts/hardhat/add-liquidity/addLiquidityProportional.ts">addLiquidityProportional.ts</a></td>
    <td><a href="scripts/foundry/add-liquidity/addLiquidityProportional.s.sol">addLiquidityProportional.s.sol</a></td>
  </tr>
  <tr>
    <td><a href="scripts/hardhat/add-liquidity/addLiquidityProportionalToERC4626.ts">addLiquidityProportionalToERC4626.ts</a></td>
    <td><a href="scripts/foundry/add-liquidity/addLiquidityProportionalToERC4626.s.sol">addLiquidityProportionalToERC4626.s.sol</a></td>
  </tr>
</table>

## Remove Liquidity

<table>
  <tr>
    <th>Kind</th>
    <th>ERC20</th>
    <th>ERC4626</th>
  </tr>
  <tr>
    <td>Proportional</td>
    <td><a href="scripts/hardhat/remove-liquidity/removeLiquidityProportional.ts">removeLiquidityProportional.ts</a></td>
    <td><a href="scripts/hardhat/remove-liquidity/removeLiquidityProportionalToERC4626.ts">removeLiquidityProportionalToERC4626.ts</a></td>
  </tr>
  <tr>
    <td>SingleTokenExactIn</td>
    <td><a href="scripts/hardhat/remove-liquidity/removeLiquiditySingleTokenExactIn.ts">removeLiquiditySingleTokenExactIn.ts</a></td>
  </tr>
    <tr>
    <td>SingleTokenExactOut</td>
    <td><a href="scripts/hardhat/remove-liquidity/removeLiquiditySingleTokenExactOut.ts">removeLiquiditySingleTokenExactOut.ts</a></td>
  </tr>
</table>

## Swap

<table>
  <tr>
    <th>Kind</th>
    <th>TypeScript</th>
    <th>Solidity</th>
  </tr>
  <tr>
    <td>GivenIn</td>
    <td>swapSingleTokenExactIn.ts</td>
    <td><a href="scripts/foundry/swap/SwapSingleTokenExactIn.s.sol">SwapSingleTokenExactIn.s.sol</a></td>
  </tr>
  <tr>
    <td>GivenOut</td>
    <td>swapSingleTokenExactOut.ts</td>
    <td><a href="scripts/foundry/swap/SwapSingleTokenExactOut.s.sol">SwapSingleTokenExactOut.s.sol</a></td>

</table>
