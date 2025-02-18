import hre from 'hardhat';
import { getContract, parseAbi, parseEther, formatEther, parseUnits } from 'viem';
import { wETH, waEthLidowETH, wstETH, waEthLidowstETH, aaveLidowETHwstETHPool } from '../utils/';
import { SwapKind, Swap, Slippage, BALANCER_ROUTER } from '@balancer/sdk';
/**
 * Before each add liquidity example runs:
 * 1. Deposit some ETH to get wETH (for boosted unbalanced add liquidity)
 * 2. Deposit some wETH into waEthLidowETH (for standard unbalanced add liquidity)
 * 3. Swap some waEthLidowETH for waETHLidowstETH ( for standard proportional add liquidity)
 * 4. swap some waEthLidowstETH for wstETH ( for boosted proportional add liquidity)
 *
 * Resulting state:
 * Default account #0 has token balances for:
 * - wETH (underlying)
 * - waEthLidowETH (erc4626)
 * - wstETH (underlying)
 * - waEthLidowstETH (erc4626)
 */
export async function setup() {
  const [walletClient] = await hre.viem.getWalletClients();

  // 1. Deposit ETH into wETH
  const wethContract = getContract({
    address: wETH,
    abi: parseAbi([
      'function deposit() payable',
      'function balanceOf(address account) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)',
    ]),
    client: walletClient,
  });

  await wethContract.write.deposit({
    value: parseEther('1000'),
  });
  const wethBalance = await wethContract.read.balanceOf([walletClient.account.address]);
  console.log(`wETH Balance: ${formatEther(wethBalance)}`);

  // 2. Deposit wETH into waEthLidowETH
  await wethContract.write.approve([waEthLidowETH, parseEther('100')]);

  const waEthLidowETHContract = getContract({
    address: waEthLidowETH,
    abi: parseAbi([
      'function deposit(uint256 assets, address receiver)',
      'function balanceOf(address account) view returns (uint256)',
    ]),
    client: walletClient,
  });

  await waEthLidowETHContract.write.deposit([parseEther('50'), walletClient.account.address]);

  const waEthLidowETHBalance = await waEthLidowETHContract.read.balanceOf([walletClient.account.address]);
  console.log(`waEthLidowETH Balance: ${formatEther(waEthLidowETHBalance)}`);
}
