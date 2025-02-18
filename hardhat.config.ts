import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import '@nomicfoundation/hardhat-foundry';
import * as dotenv from 'dotenv';

dotenv.config();

const mainnetRpcUrl = process.env.MAINNET_RPC_URL;
if (!mainnetRpcUrl) throw new Error('MAINNET_RPC_URL is not set');

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      forking: {
        url: mainnetRpcUrl,
        blockNumber: 21834000,
      },
      chainId: 1,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
