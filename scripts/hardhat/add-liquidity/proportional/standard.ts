import { parseUnits, publicActions, formatUnits } from 'viem';
import { setup } from '../setup';
import { approveOnToken, waEthLidowETH, wETH, wstETH, aaveLidowETHwstETHPool } from '../../utils';
import hre from 'hardhat';

import {
  AddLiquidityKind,
  AddLiquidity,
  BalancerApi,
  Slippage,
  Permit2Helper,
  MAX_UINT256,
  AddLiquidityProportionalInput,
  PERMIT2,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/add-liquidity/proportional/standard.ts

// TODO: figure out error -> https://www.4byte.directory/signatures/?bytes4_signature=0x8eda85e4
export async function proportionalAddLiquidityStandard() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const rpcUrl = hre.config.networks.hardhat.forking?.url!;

  const kind = AddLiquidityKind.Proportional;
  const referenceAmount = {
    rawAmount: parseUnits('1', 18),
    decimals: 18,
    address: waEthLidowETH,
  };

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.pools.fetchPoolState(aaveLidowETHwstETHPool);

  // Approve the permit2 contract as spender of tokens
  for (const token of poolState.tokens) {
    await approveOnToken(token.address, PERMIT2[chainId], MAX_UINT256);
  }

  await approveOnToken(wETH, PERMIT2[chainId], MAX_UINT256);
  await approveOnToken(wstETH, PERMIT2[chainId], MAX_UINT256);

  const addLiquidityInput: AddLiquidityProportionalInput = {
    chainId,
    rpcUrl,
    kind,
    referenceAmount,
  };

  // Query addLiquidity to get the amount of BPT out
  const addLiquidity = new AddLiquidity();
  const queryOutput = await addLiquidity.query(addLiquidityInput, poolState);

  console.log(`Expected BPT Out: ${queryOutput.bptOut.amount.toString()}`);

  const slippage = Slippage.fromPercentage('10'); // 1%

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
  .then(() => proportionalAddLiquidityStandard())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
