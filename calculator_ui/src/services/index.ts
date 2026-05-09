import CalculatorService from "@calculator-service";
import type {
  DataPoint,
  LoadTypeRS,
  PrincipalInertiaProps,
  PrincipalStressOutput,
} from "@/services/interface.ts";
import type { Beam } from "@/types/beam.ts";

export interface ICalculatorService {
  principalInertiaProps(
    equation: string,
    ny: number,
    nz: number,
  ): Promise<PrincipalInertiaProps>;
  getCombinedLoads(beam: Beam): Promise<LoadTypeRS[]>;
  generateShearData(
    length: number,
    combinedLoads: LoadTypeRS[],
  ): Promise<DataPoint[]>;
  generateMomentData(
    length: number,
    combinedLoads: LoadTypeRS[],
    step: number,
  ): Promise<DataPoint[]>;
  getPrincipalStresses(tensor: number[]): Promise<PrincipalStressOutput>;
}

export const calculatorService: ICalculatorService = new CalculatorService();
export * from "./interface";
