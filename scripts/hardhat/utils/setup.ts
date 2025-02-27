import hre from 'hardhat';
import { parseAbi, parseEther, publicActions } from 'viem';
import { wETH, waEthLidowETH, stETH, wstETH, waEthLidowstETH, aaveLidowETHwstETHPool, approveOnToken } from '.';
import {
  Slippage,
  Permit2Helper,
  PERMIT2,
  AddLiquidityKind,
  AddLiquidityBoostedV3,
  BalancerApi,
  MAX_UINT256,
} from '@balancer/sdk';

// Get account #0 some wETH and wstETH
export async function getUnderlyingTokenBalances() {
  const [walletClient] = await hre.viem.getWalletClients();
  const UNDERLYING_AMOUNT = parseEther('1000');

  // Get wETH
  await walletClient.writeContract({
    address: wETH,
    abi: parseAbi(['function deposit() payable']),
    functionName: 'deposit',
    value: UNDERLYING_AMOUNT,
  });

  // Get stETH
  await walletClient.writeContract({
    address: stETH,
    abi: parseAbi(['function submit(address _referral) external payable returns (uint256)']),
    functionName: 'submit',
    args: [walletClient.account.address],
    value: UNDERLYING_AMOUNT,
  });

  // Get wstETH
  await approveOnToken(stETH, wstETH, MAX_UINT256);

  await walletClient.writeContract({
    address: wstETH,
    abi: parseAbi(['function wrap(uint256 _stETHAmount) external returns (uint256)']),
    functionName: 'wrap',
    args: [UNDERLYING_AMOUNT],
  });
}

// Get account #0 some waEthLidowETH and waEthLidowstETH
export async function getPoolTokenBalances() {
  await getUnderlyingTokenBalances();

  const BOOSTED_AMOUNT = parseEther('100');
  const [walletClient] = await hre.viem.getWalletClients();

  // Get waEthLidowETH
  await approveOnToken(wETH, waEthLidowETH, MAX_UINT256);

  await walletClient.writeContract({
    address: waEthLidowETH,
    abi: parseAbi(['function deposit(uint256 assets, address receiver)']),
    functionName: 'deposit',
    args: [BOOSTED_AMOUNT, walletClient.account.address],
  });

  // Get waEthLidowstETH
  await approveOnToken(wstETH, waEthLidowstETH, MAX_UINT256);

  await walletClient.writeContract({
    address: waEthLidowstETH,
    abi: parseAbi(['function deposit(uint256 assets, address receiver)']),
    functionName: 'deposit',
    args: [BOOSTED_AMOUNT, walletClient.account.address],
  });
}

// Get account #0 some BPT for aaveLidowETHwstETHPool
export async function getBptBalance() {
  await getUnderlyingTokenBalances();

  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const tokensIn = [wETH, wstETH];
  const referenceAmount = {
    address: wstETH,
    decimals: 18,
    rawAmount: parseEther('10'),
  };
  const slippage = Slippage.fromPercentage('10'); // 10%

  for (const token of tokensIn) {
    await approveOnToken(token, PERMIT2[chainId], MAX_UINT256);
  }

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.boostedPools.fetchPoolStateWithUnderlyings(aaveLidowETHwstETHPool);

  const addLiquidityInput = {
    chainId,
    rpcUrl,
    kind: AddLiquidityKind.Proportional,
    referenceAmount,
    tokensIn,
  } as const;

  const addLiquidity = new AddLiquidityBoostedV3();
  const queryOutput = await addLiquidity.query(addLiquidityInput, poolState, await client.getBlockNumber());

  const permit2 = await Permit2Helper.signAddLiquidityBoostedApproval({
    ...queryOutput,
    slippage,
    client,
    owner: walletClient.account,
  });

  const call = addLiquidity.buildCallWithPermit2({ ...queryOutput, slippage }, permit2);
  await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });
}

// export async function logTokenBalances() {
//   const [walletClient] = await hre.viem.getWalletClients();
//   const client = walletClient.extend(publicActions);

//   const tokens = [
//     { address: wETH, name: 'wETH' },
//     { address: wstETH, name: 'wstETH' },
//     { address: waEthLidowETH, name: 'waEthLidowETH' },
//     { address: waEthLidowstETH, name: 'waEthLidowstETH' },
//     { address: aaveLidowETHwstETHPool, name: 'aaveLidowETHwstETHPool' },
//   ];

//   const balanceAbi = parseAbi(['function balanceOf(address account) view returns (uint256)']);

//   await Promise.all(
//     tokens.map(async ({ address, name }) => {
//       const balance = await client.readContract({
//         address,
//         abi: balanceAbi,
//         functionName: 'balanceOf',
//         args: [walletClient.account.address],
//       });
//       console.log(`${name} Balance: ${formatEther(balance)}`);
//     })
//   );
// }
