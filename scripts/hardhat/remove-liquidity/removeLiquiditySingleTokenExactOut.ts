import { parseEther, publicActions } from 'viem';
import { getBptBalance, aaveLidowETHwstETHPool, waEthLidowETH, logRemoveLiquidityDetails } from '../utils';
import hre from 'hardhat';

import { RemoveLiquidityKind, RemoveLiquidity, BalancerApi, Slippage, PermitHelper } from '@balancer/sdk';

// npx hardhat run scripts/hardhat/remove-liquidity/removeLiquiditySingleTokenExactOut.ts
export async function removeLiquiditySingleTokenExactOut() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const kind = RemoveLiquidityKind.SingleTokenExactOut as const;
  const amountOut = {
    address: waEthLidowETH,
    decimals: 18,
    rawAmount: parseEther('1'),
  };
  const slippage = Slippage.fromPercentage('5'); // 5%

  // Use balancer api to fetch pool state
  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.pools.fetchPoolState(aaveLidowETHwstETHPool);

  // Query addLiquidity to get the amount of BPT out
  const removeLiquidity = new RemoveLiquidity();
  const input = { chainId, rpcUrl, kind, amountOut };
  const blockNumber = await client.getBlockNumber();
  const queryOutput = await removeLiquidity.query(input, poolState, blockNumber);

  // Use helper to create permit signature
  const permit = await PermitHelper.signRemoveLiquidityApproval({
    ...queryOutput,
    slippage,
    client,
    owner: walletClient.account,
  });

  // Applies slippage to the BPT out amount and constructs the call
  const call = removeLiquidity.buildCallWithPermit({ ...queryOutput, slippage }, permit);

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
  .then(() => removeLiquiditySingleTokenExactOut())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
