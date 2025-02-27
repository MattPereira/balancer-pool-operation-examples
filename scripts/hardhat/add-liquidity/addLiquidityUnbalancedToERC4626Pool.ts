import { parseUnits, publicActions } from 'viem';
import {
  getPoolTokenBalances,
  approveOnToken,
  wETH,
  wstETH,
  aaveLidowETHwstETHPool,
  logAddLiquidityDetails,
} from '../utils';
import hre from 'hardhat';

import {
  AddLiquidityInput,
  AddLiquidityKind,
  AddLiquidityBoostedV3,
  BalancerApi,
  Slippage,
  InputAmount,
  Permit2Helper,
  PERMIT2,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/add-liquidity/addLiquidityUnbalancedToERC4626Pool.ts
export async function addLiquidityUnbalancedToERC4626Pool() {
  // User defined inputs
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const chainId = hre.network.config.chainId!;
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const amountsIn: InputAmount[] = [
    {
      address: wETH, // underlying for waEthLidowETH
      decimals: 18,
      rawAmount: parseUnits('1', 18),
    },
    {
      address: wstETH, // underlying for waEthLidowstETH
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
  const poolState = await balancerApi.boostedPools.fetchPoolStateWithUnderlyings(aaveLidowETHwstETHPool);

  const addLiquidityInput: AddLiquidityInput = {
    amountsIn,
    chainId,
    rpcUrl,
    kind: AddLiquidityKind.Unbalanced,
  };

  // Query addLiquidity to get the amount of BPT out
  const blockNumber = await client.getBlockNumber();
  const addLiquidity = new AddLiquidityBoostedV3();
  const queryOutput = await addLiquidity.query(addLiquidityInput, poolState, blockNumber);

  // Use helper to create the necessary permit2 signatures
  const permit2 = await Permit2Helper.signAddLiquidityBoostedApproval({
    ...queryOutput,
    slippage,
    client: walletClient.extend(publicActions),
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
  .then(() => addLiquidityUnbalancedToERC4626Pool())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
