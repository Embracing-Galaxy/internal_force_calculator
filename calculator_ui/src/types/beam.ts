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

export interface BaseLoad {
  id: string;
  magnitude: number;
}

// 向上为正, 单位：kN
export interface PointLoad extends BaseLoad {
  type: LoadType.PointLoad;
  position: number; // 位置
}

// 逆时针为正, 单位：kN·m
export interface MomentLoad extends BaseLoad {
  type: LoadType.Moment;
  position: number; // 位置
}

// 向上为正, 单位：kN/m
export interface DistributedLoad extends BaseLoad {
  type: LoadType.DistributedLoad;
  startPosition: number; // 起始位置
  endPosition: number; // 结束位置
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
