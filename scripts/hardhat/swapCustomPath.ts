import hre from 'hardhat';
import { waEthLidowETH, waEthLidowstETH, aaveLidowETHwstETHPool, approveOnToken } from './utils';
import { SwapKind, Swap, Slippage, Permit2Helper, PERMIT2 } from '@balancer/sdk';
import { parseUnits, parseEther, publicActions } from 'viem';
import { setup } from './utils/setup';

// npx hardhat run scripts/hardhat/swapCustomPath.ts
export async function swapCustomPath() {
  // user defined inputs
  const [walletClient] = await hre.viem.getWalletClients();
  const chainId = hre.network.config.chainId!;
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const slippage = Slippage.fromPercentage('1');

  const swapInput = {
    chainId,
    swapKind: SwapKind.GivenIn,
    paths: [
      {
        pools: [aaveLidowETHwstETHPool],
        tokens: [
          { address: waEthLidowETH, decimals: 18 }, // tokenIn
          { address: waEthLidowstETH, decimals: 18 }, // tokenOut
        ],
        inputAmountRaw: parseUnits('1', 18),
        outputAmountRaw: parseUnits('1', 18),
        protocolVersion: 3 as const,
      },
    ],
  };

  const swap = new Swap(swapInput);
  const queryOutput = await swap.query(rpcUrl);

  // Approve the cannonical Permit2 contract to spend waEthLidowETH
  await approveOnToken(waEthLidowETH, PERMIT2[chainId], parseEther('100'));

  const permit2 = await Permit2Helper.signSwapApproval({
    queryOutput,
    slippage,
    client: walletClient.extend(publicActions),
    owner: walletClient.account,
  });

  const call = swap.buildCallWithPermit2({ queryOutput, slippage }, permit2);

  const hash = await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });

  return hash;
}

setup()
  .then(() => swapCustomPath())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
