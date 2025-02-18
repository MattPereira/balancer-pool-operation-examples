import hre from 'hardhat';
import { erc20Abi } from '@balancer/sdk';

// Approve a spender on a token contract
export async function approveOnToken(token: `0x${string}`, spender: `0x${string}`, rawAmount: bigint) {
  const [walletClient] = await hre.viem.getWalletClients();
  const chainId = hre.network.config.chainId!;

  await walletClient.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, rawAmount],
    account: walletClient.account.address,
  });
}
