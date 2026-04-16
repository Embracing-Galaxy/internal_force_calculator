export enum SupportType {
  None = "none", // 无约束
  Hinge = "hinge", // 铰支座
  Roller = "roller", // 可动铰支座
  Fixed = "fixed", // 固定端
}

export interface SupportConfig {
  type: SupportType;
  position: number;
}

export enum LoadType {
  PointLoad = "point", // 集中力
  Moment = "moment", // 力偶
  DistributedLoad = "distributed", // 分布载荷
}

export interface PointLoad {
  type: LoadType.PointLoad;
  id: string;
  position: number; // 位置
  magnitude: number; // 大小（正向上, 负向下）单位：kN
}

export interface MomentLoad {
  type: LoadType.Moment;
  id: string;
  position: number; // 作用位置（记录用）
  magnitude: number; // 大小（正逆时针, 负顺时针）单位：kN·m
}

export interface DistributedLoad {
  type: LoadType.DistributedLoad;
  id: string;
  startPosition: number; // 起始位置
  endPosition: number; // 结束位置
  magnitude: number; // 大小（正向上, 负向下）单位：kN/m
}

export type Load = PointLoad | MomentLoad | DistributedLoad;

export interface Beam {
  length: number;
  supportA: SupportConfig;
  supportB: SupportConfig;
  loads: Load[];
}

export interface SolverError {
  type:
    | "underconstrained"
    | "overconstrained"
    | "support_out_of_range"
    | "overlapping_supports"
    | "numerical_issue";
  message: string;
  details?: {
    unknown_count?: number;
  };
}

export interface CalculationResult {
  maxShear: number;
  maxMoment: number;
}
