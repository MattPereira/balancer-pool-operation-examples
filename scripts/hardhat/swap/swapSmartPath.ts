import hre from 'hardhat';
import { setupTokenBalances, waEthLidowETH, waEthLidowstETH, aaveLidowETHwstETHPool, approveOnToken } from '../utils';
import { SwapKind, Swap, Slippage, Permit2Helper, PERMIT2 } from '@balancer/sdk';
import { parseUnits, parseEther, publicActions } from 'viem';

// npx hardhat run scripts/hardhat/swap/swapSmartPath.ts
export async function swapSmartPath() {}

setupTokenBalances()
  .then(() => swapSmartPath())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
