import { invoke } from "@tauri-apps/api/core";
import type { ICalculatorService } from "@/services/index.ts";
import {
  convertLoads,
  type DataPoint,
  DataPointSchema,
  LoadSchema,
  type LoadTypeRS,
  type PrincipalInertiaProps,
  PrincipalMomentsOutputSchema,
  type PrincipalStressOutput,
  PrincipalStressOutputSchema,
} from "@/services/types";
import type { Beam } from "@/types/beam";

export default class TauriCalculatorService implements ICalculatorService {
  async principalInertiaProps(
    equation: string,
    ny: number,
    nz: number,
  ): Promise<PrincipalInertiaProps> {
    const result = await invoke("principal_inertia", {
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
      support_a: beam.supportA,
      support_b: beam.supportB,
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

  async getPrincipalStresses(tensor: number[]): Promise<PrincipalStressOutput> {
    const result = await invoke("get_principal_stresses", { tensor });
    return PrincipalStressOutputSchema.parse(result);
  }
}
