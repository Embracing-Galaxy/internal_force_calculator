export enum SupportType {
  None = "None", // 无约束
  Hinge = "Hinge", // 铰支座
  Roller = "Roller", // 可动铰支座
  Fixed = "Fixed", // 固定端
}

export interface SupportConfig {
  support_type: SupportType;
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
