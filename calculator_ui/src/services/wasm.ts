import * as calculator_wasm from "calculator_wasm";
import type {
  ICalculatorService,
  PrincipalMomentsOutput,
} from "@/services/interface.ts";

export default class WebCalculatorService implements ICalculatorService {
  async getPrincipalMoments(
    equation: string,
    ny: number,
    nz: number,
  ): Promise<PrincipalMomentsOutput> {
    return calculator_wasm.principal_moments_and_transform(equation, ny, nz);
  }
}
