import { parseUnits, publicActions } from 'viem';
import {
  getPoolTokenBalances,
  wETH,
  wstETH,
  aaveLidowETHwstETHPool,
  approveOnToken,
  logAddLiquidityDetails,
} from '../utils';
import hre from 'hardhat';

import {
  AddLiquidityKind,
  AddLiquidityBoostedV3,
  BalancerApi,
  Slippage,
  Permit2Helper,
  AddLiquidityBoostedProportionalInput,
  MAX_UINT256,
  PERMIT2,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/add-liquidity/addLiquidityProportionalToERC4626Pool.ts
export async function addLiquidityProportionalToERC4626Pool() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const kind = AddLiquidityKind.Proportional;
  const referenceAmount = {
    rawAmount: parseUnits('1', 18),
    decimals: 18,
    address: wETH,
  };
  const tokensIn: `0x${string}`[] = [wETH, wstETH];
  const slippage = Slippage.fromPercentage('5');

  // Approve the permit2 contract as spender of tokens
  for (const tokenAddress of tokensIn) {
    await approveOnToken(tokenAddress, PERMIT2[chainId], MAX_UINT256);
  }

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.boostedPools.fetchPoolStateWithUnderlyings(aaveLidowETHwstETHPool);

  const addLiquidityInput: AddLiquidityBoostedProportionalInput = {
    chainId,
    rpcUrl,
    referenceAmount,
    tokensIn,
    kind,
  };

  // Query addLiquidity to get the amount of BPT out
  const addLiquidity = new AddLiquidityBoostedV3();
  const queryOutput = await addLiquidity.query(addLiquidityInput, poolState, await client.getBlockNumber());

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
  .then(() => addLiquidityProportionalToERC4626Pool())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
