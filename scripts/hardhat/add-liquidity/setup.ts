import hre from 'hardhat';
import { getContract, parseAbi, parseEther, formatEther } from 'viem';

const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const waEthLidowETHAddress = '0x0FE906e030a44eF24CA8c7dC7B7c53A6C4F00ce9';

/**
 * Before each add liquidity example runs:
 * 1. Deposit some ETH to get wETH
 * 2. Wrap some wETH into waEthLidowETH
 */
export async function setup() {
  const [walletClient] = await hre.viem.getWalletClients();

  const wethContract = getContract({
    address: wethAddress,
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

  await wethContract.write.approve([waEthLidowETHAddress, parseEther('10')]);

  const waEthLidowETHContract = getContract({
    address: waEthLidowETHAddress,
    abi: parseAbi([
      'function deposit(uint256 assets, address receiver)',
      'function balanceOf(address account) view returns (uint256)',
    ]),
    client: walletClient,
  });

  await waEthLidowETHContract.write.deposit([parseEther('10'), walletClient.account.address]);

  const waEthLidowETHBalance = await waEthLidowETHContract.read.balanceOf([walletClient.account.address]);
  console.log(`waEthLidowETH Balance: ${formatEther(waEthLidowETHBalance)}`);
}
