import hre from 'hardhat';
import { getContract, parseAbi, parseEther, formatEther, parseUnits, publicActions } from 'viem';
import { wETH, waEthLidowETH, wstETH, waEthLidowstETH, aaveLidowETHwstETHPool, approveOnToken } from '.';
import { SwapKind, Swap, Slippage, Permit2Helper, PERMIT2 } from '@balancer/sdk';
/**
 * Before each add liquidity example runs:
 * 1. Deposit some ETH to get wETH (for boosted unbalanced add liquidity)
 * 2. Deposit some wETH into waEthLidowETH (for standard unbalanced add liquidity)
 * 3. Swap some waEthLidowETH for waETHLidowstETH ( for standard proportional add liquidity)
 * 4. swap some waEthLidowstETH for wstETH ( for boosted proportional add liquidity)
 *
 * Default account #0 starts each example with balances for each token usable with the Aave Lido wETH-wstETH Pool:
 * - wETH (underlying)
 * - waEthLidowETH (erc4626)
 * - wstETH (underlying)
 * - waEthLidowstETH (erc4626)
 */
export async function setup() {
  // 1. Deposit ETH into wETH
  await getWeth();

  // 2. Deposit wETH into waEthLidowETH
  await getAaveWrappedETH();

  // 3. Swap some waEthLidowETH for waETHLidowstETH
  await getAaveWrappedStakedETH();

  // 4. Unwrap some waETHLidowstETH for wstETH
  await getWrappedStakedETH();
}

async function getWeth() {
  const [walletClient] = await hre.viem.getWalletClients();

  const wethContract = getContract({
    address: wETH,
    abi: parseAbi(['function deposit() payable', 'function balanceOf(address account) view returns (uint256)']),
    client: walletClient,
  });

  await wethContract.write.deposit({
    value: parseEther('1000'),
  });
  const wethBalance = await wethContract.read.balanceOf([walletClient.account.address]);
  console.log(`wETH Balance: ${formatEther(wethBalance)}`);
}

async function getAaveWrappedETH() {
  const [walletClient] = await hre.viem.getWalletClients();

  // Approve waEthLidowETH contract to spend wETH
  await walletClient.writeContract({
    address: wETH,
    abi: parseAbi(['function approve(address spender, uint256 amount)']),
    functionName: 'approve',
    args: [waEthLidowETH, parseEther('500')],
  });

  const waEthLidowETHContract = getContract({
    address: waEthLidowETH,
    abi: parseAbi([
      'function deposit(uint256 assets, address receiver)',
      'function balanceOf(address account) view returns (uint256)',
    ]),
    client: walletClient,
  });

  await waEthLidowETHContract.write.deposit([parseEther('500'), walletClient.account.address]);

  const waEthLidowETHBalance = await waEthLidowETHContract.read.balanceOf([walletClient.account.address]);
  console.log(`waEthLidowETH Balance: ${formatEther(waEthLidowETHBalance)}`);
}

async function getAaveWrappedStakedETH() {
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
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
        inputAmountRaw: parseUnits('50', 18),
        outputAmountRaw: parseUnits('50', 18),
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

  await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });

  const waEthLidowstETHBalance = await client.readContract({
    address: waEthLidowstETH,
    abi: parseAbi(['function balanceOf(address account) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [walletClient.account.address],
  });

  console.log(`waEthLidowstETH Balance: ${formatEther(waEthLidowstETHBalance)}`);
}

async function getWrappedStakedETH() {
  // withdraw from waEthLidowstETH contract

  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);

  await walletClient.writeContract({
    address: waEthLidowstETH,
    abi: parseAbi(['function withdraw(uint256 assets, address receiver, address owner)']),
    functionName: 'withdraw',
    args: [parseEther('20'), walletClient.account.address, walletClient.account.address],
  });

  const wstETHBalance = await client.readContract({
    address: wstETH,
    abi: parseAbi(['function balanceOf(address account) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [walletClient.account.address],
  });

  console.log(`wstETH Balance: ${formatEther(wstETHBalance)}`);
}
