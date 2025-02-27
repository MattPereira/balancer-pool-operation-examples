import { AddLiquidityQueryOutput, AddLiquidityBoostedQueryOutput, AddLiquidityBuildCallOutput } from '@balancer/sdk';

export function logAddLiquidityDetails(
  queryOutput: AddLiquidityQueryOutput | AddLiquidityBoostedQueryOutput,
  call: AddLiquidityBuildCallOutput
) {
  console.log(`Expected BPT Out: ${queryOutput.bptOut.amount}`);
  console.log(`Min BPT Out: ${call.minBptOut.amount}`);
  console.log(
    `Max Amounts In:`,
    call.maxAmountsIn.map((t) => t.amount)
  );
}
