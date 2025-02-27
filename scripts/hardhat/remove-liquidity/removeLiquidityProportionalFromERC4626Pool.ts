import { parseEther, publicActions } from 'viem';
import { getBptBalance, aaveLidowETHwstETHPool, wETH, wstETH, logRemoveLiquidityDetails } from '../utils';
import hre from 'hardhat';

import { RemoveLiquidityKind, RemoveLiquidityBoostedV3, BalancerApi, Slippage, PermitHelper } from '@balancer/sdk';

// npx hardhat run scripts/hardhat/remove-liquidity/removeLiquidityProportionalFromERC4626Pool.ts
export async function removeLiquidityProportionalFromERC4626Pool() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const kind = RemoveLiquidityKind.Proportional as const;
  const bptIn = {
    rawAmount: parseEther('1'),
    decimals: 18,
    address: aaveLidowETHwstETHPool,
  };
  const tokensOut = [wETH, wstETH]; // can be underlying or actual pool tokens
  const slippage = Slippage.fromPercentage('5'); // 5%

  // Use balancer api to fetch pool state
  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.boostedPools.fetchPoolStateWithUnderlyings(aaveLidowETHwstETHPool);

  // Query removeLiquidity to get the amount of BPT out
  const removeLiquidityBoosted = new RemoveLiquidityBoostedV3();
  const input = { chainId, rpcUrl, kind, bptIn, tokensOut };
  const blockNumber = await client.getBlockNumber();
  const queryOutput = await removeLiquidityBoosted.query(input, poolState, blockNumber);

  // Use helper to create permit signature
  const permit = await PermitHelper.signRemoveLiquidityBoostedApproval({
    ...queryOutput,
    slippage,
    client,
    owner: walletClient.account,
  });

  // Applies slippage to the BPT out amount and constructs the call
  const call = removeLiquidityBoosted.buildCallWithPermit({ ...queryOutput, slippage }, permit);

  const hash = await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });

  logRemoveLiquidityDetails(queryOutput, call);

  return hash;
}

getBptBalance()
  .then(() => removeLiquidityProportionalFromERC4626Pool())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
