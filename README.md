# SDK Examples

A collection of example scripts that illustrate how to use the Balancer SDK to create pools, swap tokens, add liquidity, and remove liquidity. Everything is configured to run on a local fork of Ethereum mainnet and use the [Balancer Aave Lido wETH-wstETH pool](https://balancer.fi/pools/ethereum/v3/0xc4ce391d82d164c166df9c8336ddf84206b2f812)

## Getting Started

1. Clone this repo & install dependencies

```
git clone https://github.com/balancer/pool-operation-examples-v3.git
cd pool-operation-examples-v3
pnpm install
forge install
```

2. Add a `MAINNET_RPC_URL` to a `.env` file

```
MAINNET_RPC_URL=
```

3. Run an example script

```
npx hardhat run scripts/hardhat/add-liquidity/addLiquidityProportional.ts
```

## Example Scripts

### Create Pool

- <a href="scripts/hardhat/create/createPoolStable.ts">createPoolStable.ts</a>
- <a href="scripts/hardhat/create/createPoolStableSurge.ts">createPoolStableSurge.ts</a>
- <a href="scripts/hardhat/create/createPoolWeighted.ts">createPoolWeighted.ts</a>

### Swap Tokens

- <a href="scripts/hardhat/swap/swapCustomPath.ts">swapCustomPath.ts</a>
- <a href="scripts/hardhat/swap/swapSmartPath.ts">swapSmartPath.ts</a>

### Add Liquidity

- <a href="scripts/hardhat/add-liquidity/addLiquidityProportional.ts">addLiquidityProportional.ts</a>
- <a href="scripts/hardhat/add-liquidity/addLiquidityProportionalToERC4626Pool.ts">addLiquidityProportionalToERC4626.ts</a>
- <a href="scripts/hardhat/add-liquidity/addLiquidityUnbalanced.ts">addLiquidityUnbalanced.ts</a>
- <a href="scripts/hardhat/add-liquidity/addLiquidityUnbalancedToERC4626Pool.ts">addLiquidityUnbalancedToERC4626.ts</a>

### Remove Liquidity

- <a href="scripts/hardhat/remove-liquidity/removeLiquidityProportional.ts">removeLiquidityProportional.ts</a>
- <a href="scripts/hardhat/remove-liquidity/removeLiquidityProportionalFromERC4626Pool.ts">removeLiquidityProportionalFromERC4626Pool.ts</a>
- <a href="scripts/hardhat/remove-liquidity/removeLiquiditySingleTokenExactIn.ts">removeLiquiditySingleTokenExactIn.ts</a>
- <a href="scripts/hardhat/remove-liquidity/removeLiquiditySingleTokenExactOut.ts">removeLiquiditySingleTokenExactOut.ts</a>
