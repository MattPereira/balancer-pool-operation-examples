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
