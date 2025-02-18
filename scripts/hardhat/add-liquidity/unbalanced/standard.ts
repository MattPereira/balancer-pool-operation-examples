import { parseUnits, publicActions } from 'viem';
import { setup } from '../setup';
import { approveOnToken, waEthLidowETH, waEthLidowstETH, aaveLidowETHwstETHPool } from '../../utils';
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

// npx hardhat run scripts/hardhat/add-liquidity/unbalanced/standard.ts
export async function unbalancedAddLiquidityStandard() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const rpcUrl = hre.config.networks.hardhat.forking?.url!;
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
  const slippage = Slippage.fromPercentage('1'); // 1%

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
  const addLiquidity = new AddLiquidity();
  const queryOutput = await addLiquidity.query(addLiquidityInput, poolState);

  console.log(`Expected BPT Out: ${queryOutput.bptOut.amount.toString()}`);

  // Use helper to create the necessary permit2 signatures
  const permit2 = await Permit2Helper.signAddLiquidityApproval({
    ...queryOutput,
    slippage,
    client: walletClient.extend(publicActions),
    owner: walletClient.account,
  });

  // Applies slippage to the BPT out amount and constructs the call
  const call = addLiquidity.buildCallWithPermit2({ ...queryOutput, slippage }, permit2);

  console.log(`Min BPT Out: ${call.minBptOut.amount.toString()}`);

  const hash = await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });

  return hash;
}

setup()
  .then(() => unbalancedAddLiquidityStandard())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
