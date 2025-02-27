import { parseEther, publicActions } from 'viem';
import { getBptBalance, aaveLidowETHwstETHPool, waEthLidowETH, logRemoveLiquidityDetails } from '../utils';
import hre from 'hardhat';

import {
  RemoveLiquidityKind,
  RemoveLiquidity,
  BalancerApi,
  Slippage,
  PermitHelper,
  RemoveLiquiditySingleTokenExactInInput,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/remove-liquidity/removeLiquiditySingleTokenExactIn.ts
export async function removeLiquiditySingleTokenExactIn() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const kind = RemoveLiquidityKind.SingleTokenExactIn;
  const bptIn = {
    rawAmount: parseEther('1'),
    decimals: 18,
    address: aaveLidowETHwstETHPool,
  };
  const tokenOut = waEthLidowETH;
  const slippage = Slippage.fromPercentage('5'); // 5%

  const input: RemoveLiquiditySingleTokenExactInInput = {
    chainId,
    rpcUrl,
    kind,
    bptIn,
    tokenOut,
  };

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.pools.fetchPoolState(aaveLidowETHwstETHPool);

  // Query removeLiquidity to get the amount of BPT out
  const removeLiquidity = new RemoveLiquidity();
  const queryOutput = await removeLiquidity.query(input, poolState, await client.getBlockNumber());

  // Use helper to create the necessary permit2 signatures
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
  .then(() => removeLiquiditySingleTokenExactIn())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
