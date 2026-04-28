import { invoke } from "@tauri-apps/api/core";
import type { Beam } from "@/types/beam";
import {
  convertLoads,
  convertSupportConfig,
  type DataPoint,
  DataPointSchema,
  type ICalculatorService,
  LoadSchema,
  type LoadTypeRS,
  type PrincipalMomentsOutput,
  PrincipalMomentsOutputSchema,
} from "./interface.ts";

export default class TauriCalculatorService implements ICalculatorService {
  async getPrincipalMoments(
    equation: string,
    ny: number,
    nz: number,
  ): Promise<PrincipalMomentsOutput> {
    const result = await invoke("get_principal_moments", {
      equation,
      ny,
      nz,
    });
    return PrincipalMomentsOutputSchema.parse(result);
  }

  async getCombinedLoads(beam: Beam): Promise<LoadTypeRS[]> {
    const converted = convertLoads(beam.loads);
    const result = await invoke("get_combined_loads", {
      beam_length: beam.length,
      support_a: convertSupportConfig(beam.supportA),
      support_b: convertSupportConfig(beam.supportB),
      loads: converted,
    });
    return LoadSchema.array().parse(result);
  }

  async generateShearData(
    length: number,
    combinedLoads: LoadTypeRS[],
  ): Promise<DataPoint[]> {
    const result = await invoke("gen_shear_data", {
      beam_length: length,
      combined_loads: combinedLoads,
    });
    return DataPointSchema.array().parse(result);
  }

  async generateMomentData(
    length: number,
    combinedLoads: LoadTypeRS[],
    step: number,
  ): Promise<DataPoint[]> {
    const result = await invoke("gen_moment_data", {
      beam_length: length,
      combined_loads: combinedLoads,
      step,
    });
    return DataPointSchema.array().parse(result);
  }
}
