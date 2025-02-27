import { RemoveLiquidityQueryOutput, RemoveLiquidityBuildCallOutput } from '@balancer/sdk';

export function logRemoveLiquidityDetails(
  queryOutput: RemoveLiquidityQueryOutput,
  call: RemoveLiquidityBuildCallOutput
) {
  console.log('\nRemove Liquidity Query Output:');
  console.log(`BPT In: ${queryOutput.bptIn.amount.toString()}`);
  console.table({
    tokensOut: queryOutput.amountsOut.map((a) => a.token.address),
    amountsOut: queryOutput.amountsOut.map((a) => a.amount),
  });

  console.log('\nWith slippage applied:');
  console.log(`Max BPT In: ${call.maxBptIn.amount}`);
  console.table({
    tokensOut: call.minAmountsOut.map((a) => a.token.address),
    minAmountsOut: call.minAmountsOut.map((a) => a.amount),
  });
}
