import hre from "hardhat";
import { erc20Abi, PERMIT2 } from "@balancer/sdk";

// Approve the cannonical Permit2 contract to spend some amount of tokens
export async function approveOnToken(token: `0x${string}`, rawAmount: bigint) {
  const [walletClient] = await hre.viem.getWalletClients();
  const chainId = hre.network.config.chainId!;

  await walletClient.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [PERMIT2[chainId], rawAmount],
    account: walletClient.account.address,
  });
}
