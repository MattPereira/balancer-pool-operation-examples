import hre from 'hardhat';
import { parseAbi, parseEther, formatEther, parseUnits, publicActions } from 'viem';
import { wETH, waEthLidowETH, stETH, wstETH, waEthLidowstETH, aaveLidowETHwstETHPool, approveOnToken } from '.';
import {
  Slippage,
  Permit2Helper,
  PERMIT2,
  AddLiquidityInput,
  AddLiquidityKind,
  AddLiquidityBoostedV3,
  BalancerApi,
  InputAmount,
  RemoveLiquidityKind,
  RemoveLiquidityProportionalInput,
  RemoveLiquidity,
  PermitHelper,
  MAX_UINT256,
} from '@balancer/sdk';

/**
 * Default account #0 starts each example with balances for:
 * - wETH (underlying)
 * - waEthLidowETH (erc4626)
 * - wstETH (underlying)
 * - waEthLidowstETH (erc4626)
 * - aaveLidowETHwstETHPool (BPT)
 */
export async function setupTokenBalances() {
  await getUnderlyingPoolTokens();
  await getBoostedPoolTokens();
  // await logTokenBalances();
}

async function getUnderlyingPoolTokens() {
  const [walletClient] = await hre.viem.getWalletClients();
  const UNDERLYING_AMOUNT = parseEther('4000');

  // Get wETH
  await walletClient.writeContract({
    address: wETH,
    abi: parseAbi(['function deposit() payable']),
    functionName: 'deposit',
    value: UNDERLYING_AMOUNT,
  });

  // Get wstETH
  await walletClient.writeContract({
    address: stETH,
    abi: parseAbi(['function submit(address _referral) external payable returns (uint256)']),
    functionName: 'submit',
    args: [walletClient.account.address],
    value: UNDERLYING_AMOUNT,
  });

  await walletClient.writeContract({
    address: stETH,
    abi: parseAbi(['function approve(address _spender, uint256 _amount)']),
    functionName: 'approve',
    args: [wstETH, UNDERLYING_AMOUNT],
  });

  await walletClient.writeContract({
    address: wstETH,
    abi: parseAbi(['function wrap(uint256 _stETHAmount) external returns (uint256)']),
    functionName: 'wrap',
    args: [UNDERLYING_AMOUNT],
  });
}

async function getBoostedPoolTokens() {
  const [walletClient] = await hre.viem.getWalletClients();
  const BOOSTED_AMOUNT = parseEther('1000');

  await walletClient.writeContract({
    address: wETH,
    abi: parseAbi(['function approve(address spender, uint256 amount)']),
    functionName: 'approve',
    args: [waEthLidowETH, BOOSTED_AMOUNT],
  });

  await walletClient.writeContract({
    address: waEthLidowETH,
    abi: parseAbi(['function deposit(uint256 assets, address receiver)']),
    functionName: 'deposit',
    args: [BOOSTED_AMOUNT, walletClient.account.address],
  });

  await walletClient.writeContract({
    address: wstETH,
    abi: parseAbi(['function approve(address spender, uint256 amount)']),
    functionName: 'approve',
    args: [waEthLidowstETH, BOOSTED_AMOUNT],
  });

  await walletClient.writeContract({
    address: waEthLidowstETH,
    abi: parseAbi(['function deposit(uint256 assets, address receiver)']),
    functionName: 'deposit',
    args: [BOOSTED_AMOUNT, walletClient.account.address],
  });
}

export async function getBpt() {
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const tokensIn = [wETH, wstETH];

  const referenceAmount = {
    address: wstETH,
    decimals: 18,
    rawAmount: parseEther('10'),
  };
  const slippage = Slippage.fromPercentage('10'); // 10%

  // Approve the permit2 contract as spender of tokens
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

  // Query addLiquidity to get the amount of BPT out
  const addLiquidity = new AddLiquidityBoostedV3();
  const queryOutput = await addLiquidity.query(addLiquidityInput, poolState);

  // Use helper to create the necessary permit2 signatures
  const permit2 = await Permit2Helper.signAddLiquidityBoostedApproval({
    ...queryOutput,
    slippage,
    client: walletClient.extend(publicActions),
    owner: walletClient.account,
  });

  // Applies slippage to the BPT out amount and constructs the call
  const call = addLiquidity.buildCallWithPermit2({ ...queryOutput, slippage }, permit2);

  await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });
}

export async function logTokenBalances() {
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);

  const tokens = [
    { address: wETH, name: 'wETH' },
    { address: wstETH, name: 'wstETH' },
    { address: waEthLidowETH, name: 'waEthLidowETH' },
    { address: waEthLidowstETH, name: 'waEthLidowstETH' },
    { address: aaveLidowETHwstETHPool, name: 'aaveLidowETHwstETHPool' },
  ];

  const balanceAbi = parseAbi(['function balanceOf(address account) view returns (uint256)']);

  await Promise.all(
    tokens.map(async ({ address, name }) => {
      const balance = await client.readContract({
        address,
        abi: balanceAbi,
        functionName: 'balanceOf',
        args: [walletClient.account.address],
      });
      console.log(`${name} Balance: ${formatEther(balance)}`);
    })
  );
}
