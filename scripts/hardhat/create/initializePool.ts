import { publicActions } from 'viem';
import { approveOnToken } from '../utils';
import hre from 'hardhat';

import {
  PoolType,
  InitPoolInputV3,
  InitPool,
  Permit2Helper,
  PERMIT2,
  MAX_UINT256,
  vaultExtensionAbi_V3,
  VAULT_V3,
} from '@balancer/sdk';

// Helper function for create pool scripts
export async function initializePool(poolAddress: `0x${string}`, input: InitPoolInputV3) {
  // User defined inputs
  const chainId = input.chainId;
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const poolType = PoolType.Stable;
  const protocolVersion = 3 as const;

  // Approve the permit2 contract as spender of tokens
  for (const token of input.amountsIn) {
    await approveOnToken(token.address, PERMIT2[chainId], MAX_UINT256);
  }

  // // SKD's InitPoolDataProvider does not make use of client that is connected to local fork, so won't work for examples
  // const initPoolDataProvider = new InitPoolDataProvider(chainId, rpcUrl);
  // const poolState = await initPoolDataProvider.getInitPoolData(poolAddress, poolType, protocolVersion);

  // Construct the pool state manually
  const poolTokens = await client.readContract({
    abi: vaultExtensionAbi_V3,
    address: VAULT_V3[chainId],
    functionName: 'getPoolTokens',
    args: [poolAddress],
  });

  const tokens = poolTokens.map((address, index) => ({
    index,
    address: address.toLowerCase() as `0x${string}`,
    decimals: 18,
  }));

  const poolState = {
    id: poolAddress,
    address: poolAddress as `0x${string}`,
    type: poolType,
    protocolVersion,
    tokens,
  };

  // Sign permit2 approval
  const permit2 = await Permit2Helper.signInitPoolApproval({
    ...input,
    client,
    owner: walletClient.account,
  });

  const initPool = new InitPool();
  const initPoolCall = initPool.buildCallWithPermit2(input, poolState, permit2);

  const initPoolHash = await walletClient.sendTransaction({
    account: walletClient.account,
    data: initPoolCall.callData,
    to: initPoolCall.to,
  });

  const initPoolReceipt = await client.waitForTransactionReceipt({ hash: initPoolHash });

  console.log('Initialization status:', initPoolReceipt.status);
}
