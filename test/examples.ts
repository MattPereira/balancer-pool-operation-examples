import { expect } from 'chai';
import hre from 'hardhat';
import {
  addLiquidityUnbalanced,
  addLiquidityUnbalancedToERC4626Pool,
  addLiquidityProportional,
  addLiquidityProportionalToERC4626Pool,
} from '../scripts/hardhat/add-liquidity';
import { PublicClient } from 'viem';

// TODO: figure out how to run basic tests that checks if tx returned by each example script is success
// PROBLEM: the setup for each script runs like 4 times and fails before any tests execute, even tho `setupTokenBalances()` is never even called by this test
describe('Example pool operation scripts', function () {
  let publicClient: PublicClient;

  before(async function () {
    publicClient = await hre.viem.getPublicClient();
  });

  // describe('Add Liquidity', function () {
  it('Unbalanced Standard', async function () {
    expect(true).to.equal(true);
    const hash = await addLiquidityUnbalanced();
    const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
    expect(txReceipt.status).to.equal('success');
  });
  // it('Unbalanced Boosted', async function () {
  //   const hash = await addLiquidityUnbalancedToERC4626Pool();
  //   const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
  //   expect(txReceipt.status).to.equal('success');
  // });
  // it('Proportional Standard', async function () {
  //   const hash = await addLiquidityProportional();
  //   const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
  //   expect(txReceipt.status).to.equal('success');
  // });
  // it('Proportional Boosted', async function () {
  //   const hash = await addLiquidityProportionalToERC4626Pool();
  //   const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
  //   expect(txReceipt.status).to.equal('success');
  // });
  // });
});
