import { expect } from 'chai';
import hre from 'hardhat';
import {
  addLiquidityUnbalanced,
  addLiquidityProportional,
  addLiquidityUnbalancedToERC4626Pool,
  addLiquidityProportionalToERC4626Pool,
} from '../scripts/hardhat/add-liquidity';
import { setupTokenBalances } from '../scripts/hardhat/utils/setup';
import { PublicClient } from 'viem';

// TODO: figure out how to run basic test that checks if tx returned by each example script is success
// PROBLEM: the setup for each script runs like 4 times and fails before any tests execute and they seem to time out before finishinsg?
describe('Example pool operation scripts', function () {
  let publicClient: PublicClient;

  before(async function () {
    publicClient = await hre.viem.getPublicClient();
    await setupTokenBalances();
  });

  describe('Add Liquidity', function () {
    it('Proportional Standard', async function () {
      const hash = await addLiquidityProportional();
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(txReceipt.status).to.equal('success');
    });

    it('Unbalanced Standard', async function () {
      const hash = await addLiquidityUnbalanced();
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(txReceipt.status).to.equal('success');
    });

    it('Proportional Boosted', async function () {
      const hash = await addLiquidityProportionalToERC4626Pool();
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(txReceipt.status).to.equal('success');
    });

    it('Unbalanced Boosted', async function () {
      const hash = await addLiquidityUnbalancedToERC4626Pool();
      const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(txReceipt.status).to.equal('success');
    });
  });
});
