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
  // 1. Deposit ETH (to get wETH)
  await getWeth();

  // 2. Submit ETH to get stETH and deposit stETH to get wstETH
  await getWstETH();

  // 3. Proportionally add wETH to wstETH to aaveLidowETHwstETHPool (to get BPT)
  await getBpt();

  // // 3. Remove liquidity from aaveLidowETHwstETHPool (to get waEthLidowETH and waEthLidowstETH)
  // await getBoostedPoolTokens();

  // // 4. Withdraw from waEthLidowstETH Vault ( to get wstETH )
  // await getWrappedStakedETH();

  await logTokenBalances();
}

async function getWeth() {
  const [walletClient] = await hre.viem.getWalletClients();

  await walletClient.writeContract({
    address: wETH,
    abi: parseAbi(['function deposit() payable']),
    functionName: 'deposit',
    value: parseEther('4000'),
  });
}

async function getWstETH() {
  const [walletClient] = await hre.viem.getWalletClients();
  const publicClient = walletClient.extend(publicActions);

  await walletClient.writeContract({
    address: stETH,
    abi: parseAbi(['function submit(address _referral) external payable returns (uint256)']),
    functionName: 'submit',
    args: [walletClient.account.address],
    value: parseEther('4000'),
  });

  await walletClient.writeContract({
    address: stETH,
    abi: parseAbi(['function approve(address _spender, uint256 _amount)']),
    functionName: 'approve',
    args: [wstETH, parseEther('4000')],
  });

  await walletClient.writeContract({
    address: wstETH,
    abi: parseAbi(['function wrap(uint256 _stETHAmount) external returns (uint256)']),
    functionName: 'wrap',
    args: [3999999999999999999000n],
  });

  const wstETHBalance = await publicClient.readContract({
    address: wstETH,
    abi: parseAbi(['function balanceOf(address account) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [walletClient.account.address],
  });

  console.log('wstETHBalance', wstETHBalance);
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

export async function getBoostedPoolTokens() {
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const kind = RemoveLiquidityKind.Proportional;
  const bptIn: InputAmount = {
    rawAmount: parseEther('100'),
    decimals: 18,
    address: aaveLidowETHwstETHPool,
  };
  const slippage = Slippage.fromPercentage('50'); // TODO: Understand why high slippage required for this proportional remove? Because pool thrown off balance by the huge unbalanced wETH add as part of `getBpt()`?

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.pools.fetchPoolState(aaveLidowETHwstETHPool);

  const removeLiquidityInput: RemoveLiquidityProportionalInput = {
    chainId,
    rpcUrl,
    kind,
    bptIn,
  };

  // Query addLiquidity to get the amount of BPT out
  const removeLiquidity = new RemoveLiquidity();
  const queryOutput = await removeLiquidity.query(removeLiquidityInput, poolState);

  // Use helper to create the necessary permit2 signatures
  const permit2 = await PermitHelper.signRemoveLiquidityApproval({
    ...queryOutput,
    slippage,
    client: walletClient.extend(publicActions),
    owner: walletClient.account,
  });

  // Applies slippage to the BPT out amount and constructs the call
  const call = removeLiquidity.buildCallWithPermit({ ...queryOutput, slippage }, permit2);

  await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });
}

export async function getWrappedStakedETH() {
  const [walletClient] = await hre.viem.getWalletClients();

  await walletClient.writeContract({
    address: waEthLidowstETH,
    abi: parseAbi(['function withdraw(uint256 assets, address receiver, address owner)']),
    functionName: 'withdraw',
    args: [parseEther('20'), walletClient.account.address, walletClient.account.address],
  });
}

export async function logTokenBalances() {
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);

  const tokens = [
    { address: wETH, name: 'wETH' },
    { address: waEthLidowETH, name: 'waEthLidowETH' },
    { address: wstETH, name: 'wstETH' },
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
