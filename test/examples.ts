// import { expect } from 'chai';
// import hre from 'hardhat';
// import { addLiquidityUnbalanced, addLiquidityUnbalancedToERC4626Pool } from '../scripts/hardhat';
// import { setup } from '../scripts/hardhat/utils';
// import { PublicClient } from 'viem';
// import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

// describe('Example pool operation scripts', function () {
//   // let publicClient: PublicClient;

//   async function deployFixture() {
//     const publicClient = await hre.viem.getPublicClient();
//     await setup();
//     return { publicClient };
//   }

//   describe('Add Liquidity', function () {
//     // it('Proportional Standard', async function () {
//     //   const hash = await addLiquidityProportional();
//     //   const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
//     //   expect(txReceipt.status).to.equal('success');
//     // });

//     // it('Proportional Boosted', async function () {
//     //   const hash = await addLiquidityProportionalToERC4626Pool();
//     //   const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
//     //   expect(txReceipt.status).to.equal('success');
//     // });

//     // it('Unbalanced Standard', async function () {
//     //   const hash = await addLiquidityUnbalanced();
//     //   const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
//     //   expect(txReceipt.status).to.equal('success');
//     // });

//     it('Unbalanced Boosted', async function () {
//       const { publicClient } = await loadFixture(deployFixture);

//       const hash = await addLiquidityUnbalancedToERC4626Pool();
//       const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
//       expect(txReceipt.status).to.equal('success');
//     });
//   });
// });
