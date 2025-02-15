// import { expect } from "chai";
// import hre from "hardhat";
// import {
//   addLiquidityBoosted,
//   addLiquidityStandard,
// } from "../scripts/";
// import { PublicClient } from "viem";
// describe("Transaction status returned by examples should be success", function () {
//   let publicClient: PublicClient;

//   before(async function () {
//     publicClient = await hre.viem.getPublicClient();
//   });

//   it("Add Liquidity Standard", async function () {
//     const hash = await addLiquidityStandard();
//     const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
//     expect(txReceipt.status).to.equal("success");
//   });

//   it("Add Liquidity Boosted", async function () {
//     const hash = await addLiquidityBoosted();
//     const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
//     expect(txReceipt.status).to.equal("success");
//   });
// });
