import * as calculator_wasm from "calculator_wasm";
import type { ICalculatorService } from "@/services/index.ts";
import {
  convertLoads,
  convertSupportConfig,
  type DataPoint,
  type LoadTypeRS,
  type PrincipalInertiaProps,
  type PrincipalStressOutput,
} from "@/services/types";
import type { Beam } from "@/types/beam";

export default class WebCalculatorService implements ICalculatorService {
  async principalInertiaProps(
    equation: string,
    ny: number,
    nz: number,
  ): Promise<PrincipalInertiaProps> {
    return calculator_wasm.principal_inertia(equation, ny, nz);
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

  async getPrincipalStresses(tensor: number[]): Promise<PrincipalStressOutput> {
    return calculator_wasm.principal_stresses(tensor);
  }
}
