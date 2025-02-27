import { parseUnits, publicActions } from 'viem';
import {
  getPoolTokenBalances,
  approveOnToken,
  waEthLidowETH,
  waEthLidowstETH,
  aaveLidowETHwstETHPool,
  logAddLiquidityDetails,
} from '../utils';
import hre from 'hardhat';

import {
  AddLiquidityInput,
  AddLiquidityKind,
  AddLiquidity,
  BalancerApi,
  Slippage,
  InputAmount,
  Permit2Helper,
  PERMIT2,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/add-liquidity/addLiquidityUnbalanced.ts
export async function addLiquidityUnbalanced() {
  // User defined inputs
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const chainId = hre.network.config.chainId!;
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const amountsIn: InputAmount[] = [
    {
      address: waEthLidowETH,
      decimals: 18,
      rawAmount: parseUnits('1', 18),
    },
    {
      address: waEthLidowstETH,
      decimals: 18,
      rawAmount: 0n,
    },
  ];
  const slippage = Slippage.fromPercentage('5'); // 5%

  // Approve the permit2 contract as spender of tokens
  for (const token of amountsIn) {
    await approveOnToken(token.address, PERMIT2[chainId], token.rawAmount);
  }

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.pools.fetchPoolState(aaveLidowETHwstETHPool);

  const addLiquidityInput: AddLiquidityInput = {
    amountsIn,
    chainId,
    rpcUrl,
    kind: AddLiquidityKind.Unbalanced,
  };

  // Query addLiquidity to get the amount of BPT out
  const blockNumber = await client.getBlockNumber();
  const addLiquidity = new AddLiquidity();
  const queryOutput = await addLiquidity.query(addLiquidityInput, poolState, blockNumber);

  // Use helper to create the necessary permit2 signatures
  const permit2 = await Permit2Helper.signAddLiquidityApproval({
    ...queryOutput,
    slippage,
    client,
    owner: walletClient.account,
  });

  // Applies slippage to the BPT out amount and constructs the call
  const call = addLiquidity.buildCallWithPermit2({ ...queryOutput, slippage }, permit2);

  const hash = await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });

  logAddLiquidityDetails(queryOutput, call);

  return hash;
}

getPoolTokenBalances()
  .then(() => addLiquidityUnbalanced())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
