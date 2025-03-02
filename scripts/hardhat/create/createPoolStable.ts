import { parseEther, publicActions, zeroAddress, parseEventLogs } from 'viem';
import { getPoolTokenBalances, waEthLidowETH, waEthLidowstETH } from '../utils';
import { initializePool } from './initializePool';
import hre from 'hardhat';

import { CreatePool, CreatePoolV3StableInput, PoolType, TokenType, stablePoolFactoryAbi_V3 } from '@balancer/sdk';

// npx hardhat run scripts/hardhat/create/createPoolStable.ts
export async function createPoolStable() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const client = walletClient.extend(publicActions);
  const poolType = PoolType.Stable;
  const protocolVersion = 3 as const;

  const createPoolInput: CreatePoolV3StableInput = {
    poolType,
    chainId,
    protocolVersion,
    name: 'Balancer Aave Lido wETH-wstETH',
    symbol: 'Aave Lido wETH-wstETH',
    amplificationParameter: 5000n,
    tokens: [
      {
        address: waEthLidowETH,
        rateProvider: '0xf4b5d1c22f35a460b91edd7f33cefe619e2faaf4',
        tokenType: TokenType.TOKEN_WITH_RATE,
        paysYieldFees: true,
      },
      {
        address: waEthLidowstETH,
        rateProvider: '0xcdaa68ce322728fe4185a60f103c194f1e2c47bc',
        tokenType: TokenType.TOKEN_WITH_RATE,
        paysYieldFees: true,
      },
    ],
    swapFeePercentage: parseEther('0.01'),
    poolHooksContract: zeroAddress,
    pauseManager: client.account.address,
    swapFeeManager: client.account.address,
    disableUnbalancedLiquidity: false,
    enableDonation: false,
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
        rawAmount: parseEther('1'),
        decimals: 18,
      },
      {
        address: waEthLidowstETH,
        rawAmount: parseEther('1'),
        decimals: 18,
      },
    ],
  });
}

getPoolTokenBalances()
  .then(() => createPoolStable())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
