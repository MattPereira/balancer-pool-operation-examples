import {
  ExactInQueryOutput,
  ExactOutQueryOutput,
  SwapBuildOutputExactIn,
  SwapBuildOutputExactOut,
  SwapKind,
  Swap,
} from '@balancer/sdk';

export function logSwapDetails(
  swap: Swap,
  queryOutput: ExactInQueryOutput | ExactOutQueryOutput,
  call: SwapBuildOutputExactIn | SwapBuildOutputExactOut
) {
  if (queryOutput.swapKind === SwapKind.GivenIn) {
    console.table([
      {
        Type: 'Given Token In',
        Address: swap.inputAmount.token.address,
        Amount: swap.inputAmount.amount,
      },
    ]);
  } else {
    console.table([
      {
        Type: 'Expected Amount In',
        Address: swap.outputAmount.token.address,
        Amount: swap.outputAmount.amount,
      },
    ]);
  }
}
