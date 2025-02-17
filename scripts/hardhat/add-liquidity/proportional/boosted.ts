import { parseUnits, publicActions } from 'viem';
import { setup } from '../setup';
import { approveOnToken } from '../../utils';
import hre from 'hardhat';

import {
  AddLiquidityKind,
  AddLiquidityBoostedV3,
  BalancerApi,
  Slippage,
  Permit2Helper,
  AddLiquidityBoostedProportionalInput,
  MAX_UINT256,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/add-liquidity/proportional/boosted.ts
export async function proportionalAddLiquidityBoosted() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const rpcUrl = hre.config.networks.hardhat.forking?.url!;
  const pool = '0xc4Ce391d82D164c166dF9c8336DDF84206b2F812'; // https://balancer.fi/pools/ethereum/v3/0xc4ce391d82d164c166df9c8336ddf84206b2f812
  const kind = AddLiquidityKind.Proportional;
  const wETH: `0x${string}` = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const wstETH: `0x${string}` = '0x775f661b0bd1739349b9a2a3ef60be277c5d2d29';
  const tokensIn = [wETH, wstETH];
  const referenceAmount = {
    rawAmount: parseUnits('1', 18),
    decimals: 18,
    address: wETH,
  };

  // Approve the permit2 contract as spender of tokens
  for (const tokenAddress of tokensIn) {
    await approveOnToken(tokenAddress, MAX_UINT256);
  }

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.boostedPools.fetchPoolStateWithUnderlyings(pool);

  const addLiquidityInput: AddLiquidityBoostedProportionalInput = {
    chainId,
    rpcUrl,
    referenceAmount,
    tokensIn,
    kind,
  };

  // Query addLiquidity to get the amount of BPT out
  const addLiquidity = new AddLiquidityBoostedV3();
  const queryOutput = await addLiquidity.query(addLiquidityInput, poolState);

  console.log(`Expected BPT Out: ${queryOutput.bptOut.amount.toString()}`);

  const slippage = Slippage.fromPercentage('1'); // 1%
  const queryOutputWithSlippage = { ...queryOutput, slippage };

  // Use helper to create the necessary permit2 signatures
  const permit2 = await Permit2Helper.signAddLiquidityBoostedApproval({
    ...queryOutputWithSlippage,
    client: walletClient.extend(publicActions),
    owner: walletClient.account,
  });

  // Applies slippage to the BPT out amount and constructs the call
  const call = addLiquidity.buildCallWithPermit2(queryOutputWithSlippage, permit2);

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
  .then(() => proportionalAddLiquidityBoosted())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
