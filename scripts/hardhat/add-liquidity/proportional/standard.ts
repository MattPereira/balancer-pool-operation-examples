import { parseUnits, publicActions } from 'viem';
import { setup } from '../setup';
import { approveOnToken } from '../../utils';
import hre from 'hardhat';

import {
  AddLiquidityKind,
  AddLiquidity,
  BalancerApi,
  Slippage,
  Permit2Helper,
  MAX_UINT256,
  AddLiquidityProportionalInput,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/add-liquidity/proportional/standard.ts
export async function proportionalAddLiquidityStandard() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const rpcUrl = hre.config.networks.hardhat.forking?.url!;
  const pool = '0xc4Ce391d82D164c166dF9c8336DDF84206b2F812'; // https://balancer.fi/pools/ethereum/v3/0xc4ce391d82d164c166df9c8336ddf84206b2f812
  const waEthLidoWETH: `0x${string}` = '0x0fe906e030a44ef24ca8c7dc7b7c53a6c4f00ce9';

  const kind = AddLiquidityKind.Proportional;
  const referenceAmount = {
    rawAmount: parseUnits('1', 18),
    decimals: 18,
    address: waEthLidoWETH,
  };

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.pools.fetchPoolState(pool);

  // Approve the permit2 contract as spender of tokens
  for (const token of poolState.tokens) {
    await approveOnToken(token.address, MAX_UINT256);
  }

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

  const slippage = Slippage.fromPercentage('1'); // 1%
  const queryOutputWithSlippage = { ...queryOutput, slippage };

  // Use helper to create the necessary permit2 signatures
  const permit2 = await Permit2Helper.signAddLiquidityApproval({
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
  .then(() => proportionalAddLiquidityStandard())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
