import { parseEther, parseUnits, publicActions, parseEventLogs, zeroAddress } from 'viem';
import { getPoolTokenBalances, waEthLidowETH, waEthLidowstETH } from '../utils';
import { initializePool } from './initializePool';
import hre from 'hardhat';

import { CreatePool, CreatePoolV3WeightedInput, PoolType, TokenType, stablePoolFactoryAbi_V3 } from '@balancer/sdk';

// npx hardhat run scripts/hardhat/create/createPoolWeighted.ts
export async function createPoolWeighted() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const poolType = PoolType.Weighted;
  const protocolVersion = 3 as const;

  const createPoolInput: CreatePoolV3WeightedInput = {
    poolType,
    chainId,
    protocolVersion,
    name: 'Balancer Aave Lido wETH-wstETH',
    symbol: 'Aave Lido wETH-wstETH',
    tokens: [
      {
        address: waEthLidowETH,
        rateProvider: '0xf4b5d1c22f35a460b91edd7f33cefe619e2faaf4',
        tokenType: TokenType.TOKEN_WITH_RATE,
        paysYieldFees: true,
        weight: parseUnits('80', 16), // 80%
      },
      {
        address: waEthLidowstETH,
        rateProvider: '0xcdaa68ce322728fe4185a60f103c194f1e2c47bc',
        tokenType: TokenType.TOKEN_WITH_RATE,
        paysYieldFees: true,
        weight: parseUnits('20', 16), // 20%
      },
    ],
    swapFeePercentage: parseEther('0.01'),
    poolHooksContract: zeroAddress,
    pauseManager: client.account.address,
    swapFeeManager: client.account.address,
    enableDonation: false,
    disableUnbalancedLiquidity: false,
  };

  const createPool = new CreatePool();
  const createPoolCall = createPool.buildCall(createPoolInput);

  const createHash = await walletClient.sendTransaction({
    account: walletClient.account,
    data: createPoolCall.callData,
    to: createPoolCall.to,
  });

  const txReceipt = await client.waitForTransactionReceipt({ hash: createHash });

  const poolCreatedEvent = parseEventLogs({
    logs: txReceipt.logs,
    abi: stablePoolFactoryAbi_V3,
  });

  // @ts-expect-error pool address exists in args
  const poolAddress = poolCreatedEvent[0]?.args?.pool as `0x${string}`;

  console.log(`${poolType} pool created at: ${poolAddress}`);

  await initializePool(poolAddress, {
    chainId,
    minBptAmountOut: 0n,
    amountsIn: [
      {
        address: waEthLidowETH,
        rawAmount: parseEther('0.8'),
        decimals: 18,
      },
      {
        address: waEthLidowstETH,
        rawAmount: parseEther('0.2'),
        decimals: 18,
      },
    ],
  });
}

getPoolTokenBalances()
  .then(() => createPoolWeighted())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
