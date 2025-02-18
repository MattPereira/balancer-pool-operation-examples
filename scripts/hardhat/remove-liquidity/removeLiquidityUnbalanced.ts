import { parseEther, publicActions } from 'viem';
import { setupTokenBalances, aaveLidowETHwstETHPool } from '../utils';
import hre from 'hardhat';

import {
  RemoveLiquidityKind,
  RemoveLiquidity,
  BalancerApi,
  Slippage,
  PermitHelper,
  RemoveLiquidityProportionalInput,
  InputAmount,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/remove-liquidity/removeLiquidityUnbalanced.ts
export async function removeLiquidityUnbalanced() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const kind = RemoveLiquidityKind.Proportional;
  const bptIn: InputAmount = {
    rawAmount: parseEther('1'),
    decimals: 18,
    address: aaveLidowETHwstETHPool,
  };
  const slippage = Slippage.fromPercentage('5'); // 5%

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.pools.fetchPoolState(aaveLidowETHwstETHPool);
}

setupTokenBalances()
  .then(() => removeLiquidityUnbalanced())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
