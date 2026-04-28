import * as calculator_wasm from "calculator_wasm";
import {
  convertLoads,
  convertSupportConfig,
  type DataPoint,
  type ICalculatorService,
  type LoadTypeRS,
  type PrincipalMomentsOutput,
} from "@/services/interface.ts";
import type { Beam } from "@/types/beam";

export default class WebCalculatorService implements ICalculatorService {
  async getPrincipalMoments(
    equation: string,
    ny: number,
    nz: number,
  ): Promise<PrincipalMomentsOutput> {
    return calculator_wasm.principal_moments_and_transform(equation, ny, nz);
  }

  async getCombinedLoads(beam: Beam): Promise<LoadTypeRS[]> {
    return calculator_wasm.get_combined_loads(
      beam.length,
      convertSupportConfig(beam.supportA),
      convertSupportConfig(beam.supportB),
      convertLoads(beam.loads),
    );
  }

  async generateShearData(
    length: number,
    combinedLoads: LoadTypeRS[],
  ): Promise<DataPoint[]> {
    return calculator_wasm.generate_shear_data(length, combinedLoads);
  }

  async generateMomentData(
    length: number,
    combinedLoads: LoadTypeRS[],
    step: number,
  ): Promise<DataPoint[]> {
    return calculator_wasm.generate_moment_data(length, combinedLoads, step);
  }
}
