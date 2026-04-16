import type {
  ICalculatorService,
  PrincipalMomentsOutput,
} from "@/services/interface.ts";

interface WASMCalculator {
  principal_moments_and_transform(
    equation: string,
    ny: number,
    nz: number,
  ): Promise<PrincipalMomentsOutput>;
}

export default class WebCalculatorService implements ICalculatorService {
  async getPrincipalMoments(
    equation: string,
    ny: number,
    nz: number,
  ): Promise<PrincipalMomentsOutput> {
    const wasm = (await import("calculator_wasm")) as unknown as WASMCalculator;
    return (await wasm).principal_moments_and_transform(equation, ny, nz);
  }
}
