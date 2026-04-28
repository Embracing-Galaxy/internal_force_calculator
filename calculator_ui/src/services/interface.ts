import { z } from "zod";
import {
  type Beam,
  type Load,
  LoadType,
  type SupportConfig,
  SupportType,
} from "@/types/beam";

export const PrincipalMomentsOutputSchema = z.object({
  area: z.number(),
  yc: z.number(),
  zc: z.number(),
  imin: z.number(),
  imax: z.number(),
  theta: z.number(),
});
export type PrincipalMomentsOutput = z.infer<
  typeof PrincipalMomentsOutputSchema
>;

export const DataPointSchema = z.object({
  x: z.number(),
  value: z.number(),
});
export type DataPoint = z.infer<typeof DataPointSchema>;

export const PointLoadSchema = z.object({
  position: z.number(),
  magnitude: z.number(),
});

export const MomentLoadSchema = z.object({
  position: z.number(),
  magnitude: z.number(),
});

export const DistributedLoadSchema = z.object({
  start_position: z.number(),
  end_position: z.number(),
  magnitude: z.number(),
});

export const LoadSchema = z.union([
  z.object({ PointLoad: PointLoadSchema }),
  z.object({ Moment: MomentLoadSchema }),
  z.object({ DistributedLoad: DistributedLoadSchema }),
]);

export type LoadTypeRS = z.infer<typeof LoadSchema>;

export function convertLoads(loads: Load[]) {
  return loads.map((load) => {
    switch (load.type) {
      case LoadType.PointLoad:
        return {
          PointLoad: {
            position: load.position,
            magnitude: load.magnitude,
          },
        };
      case LoadType.Moment:
        return {
          Moment: {
            position: load.position,
            magnitude: load.magnitude,
          },
        };
      case LoadType.DistributedLoad:
        return {
          DistributedLoad: {
            start_position: load.startPosition,
            end_position: load.endPosition,
            magnitude: load.magnitude,
          },
        };
      default:
        return {};
    }
  });
}

const typeMap: Record<SupportType, string> = {
  [SupportType.None]: "None",
  [SupportType.Hinge]: "Hinge",
  [SupportType.Roller]: "Roller",
  [SupportType.Fixed]: "Fixed",
};

export function convertSupportConfig(config: SupportConfig) {
  return {
    support_type: typeMap[config.type],
    position: config.position,
  };
}

export interface ICalculatorService {
  getPrincipalMoments(
    equation: string,
    ny: number,
    nz: number,
  ): Promise<PrincipalMomentsOutput>;
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
}
