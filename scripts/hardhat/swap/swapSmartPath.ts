import hre from 'hardhat';
import { publicActions } from 'viem';
import { getPoolTokenBalances, waEthLidowETH, waEthLidowstETH, approveOnToken, logSwapDetails } from '../utils';

import {
  SwapKind,
  Swap,
  Slippage,
  Permit2Helper,
  PERMIT2,
  BalancerApi,
  TokenAmount,
  Token,
  MAX_UINT256,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/swap/swapSmartPath.ts
export async function swapSmartPath() {
  // user defined inputs
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const chainId = hre.network.config.chainId!;
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const tokenIn = new Token(chainId, waEthLidowETH, 18, 'waEthLidowETH');
  const tokenOut = new Token(chainId, waEthLidowstETH, 18, 'waEthLidowstETH');
  const swapKind = SwapKind.GivenIn;
  const swapAmount = TokenAmount.fromHumanAmount(tokenIn, '1');
  const slippage = Slippage.fromPercentage('1');

  // Approve the cannonical Permit2 contract to spend waEthLidowETH
  await approveOnToken(waEthLidowETH, PERMIT2[chainId], MAX_UINT256);

  // Use API and SOR to fetch best paths
  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const paths = await balancerApi.sorSwapPaths.fetchSorSwapPaths({
    chainId,
    tokenIn: tokenIn.address,
    tokenOut: tokenOut.address,
    swapKind,
    swapAmount,
  });

  const swap = new Swap({ chainId, paths, swapKind });
  const queryOutput = await swap.query(rpcUrl, await client.getBlockNumber());

  const permit2 = await Permit2Helper.signSwapApproval({
    queryOutput,
    slippage,
    client,
    owner: walletClient.account,
  });

  const call = swap.buildCallWithPermit2({ queryOutput, slippage }, permit2);

  const hash = await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });

  logSwapDetails(swap, queryOutput, call);

  return hash;
}

getPoolTokenBalances()
  .then(() => swapSmartPath())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
