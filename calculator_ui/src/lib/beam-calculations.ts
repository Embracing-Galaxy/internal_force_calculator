import { nanoid } from "nanoid";
import {
  type Beam,
  type Load,
  LoadType,
  type SolverError,
  SupportType,
} from "@/types/beam";

// 实际计算梁的内力
export async function sumForces(beam: Beam): Promise<Load[] | SolverError> {
  const hasFixedSupport =
    beam.supportA.type === SupportType.Fixed ||
    beam.supportB.type === SupportType.Fixed;
  const hasTwoSupport =
    beam.supportA.type !== SupportType.None &&
    beam.supportB.type !== SupportType.None;
  if (hasFixedSupport && hasTwoSupport)
    return {
      type: "overconstrained",
      message: "结构超静定，无法计算",
    };

  // 计算约束反力
  const reactions = calculateReactions(beam, hasFixedSupport);
  if (!reactions)
    return {
      type: "underconstrained",
      message: "结构静不定，无法计算",
    };

  return [...beam.loads, ...reactions];
}

// 计算约束反力
function calculateReactions(
  beam: Beam,
  hasFixedSupport: boolean,
): Load[] | null {
  // 计算所有外力的合力和合力矩
  let totalForce = 0;
  let totalMoment = 0;

  // 计算荷载
  beam.loads.forEach((load) => {
    if (load.type === LoadType.PointLoad) {
      totalForce += load.magnitude;
      totalMoment += load.magnitude * load.position;
    } else if (load.type === LoadType.Moment) {
      totalMoment += load.magnitude;
    } else if (load.type === LoadType.DistributedLoad) {
      const length = load.endPosition - load.startPosition;
      const force = load.magnitude * length;
      totalForce += force;
      // 分布载荷的合力作用点在中点
      const centerPosition = (load.startPosition + load.endPosition) / 2;
      totalMoment += force * centerPosition;
    }
  });

  if (hasFixedSupport) {
    // 有固定端的情况（有约束力矩）
    const isSupportA = beam.supportA.type === SupportType.Fixed;
    const fixedSupport = isSupportA ? beam.supportA : beam.supportB;
    // 固定端在A：反力矩 = -totalMoment
    // 固定端在B：对B点取矩，反力矩 = -(totalMoment - totalForce * beam.length)
    const moment = isSupportA
      ? -totalMoment
      : -(totalMoment - totalForce * beam.length);

    // 支座的反力和反力矩
    return [
      {
        id: nanoid(),
        type: LoadType.PointLoad,
        position: fixedSupport.position,
        magnitude: -totalForce,
      },
      {
        id: nanoid(),
        type: LoadType.Moment,
        position: fixedSupport.position,
        magnitude: moment,
      },
    ];
  }

  if (
    beam.supportA.type === SupportType.None ||
    beam.supportB.type === SupportType.None
  )
    return null; // 静不定

  // 两个支座
  // 对支座A取矩：fb * (posB - posA) + totalMoment - totalForce * posA = 0
  const fb =
    -(totalMoment - totalForce * beam.supportA.position) /
    (beam.supportB.position - beam.supportA.position);
  const fa = -totalForce - fb;

  return [
    {
      id: nanoid(),
      type: LoadType.PointLoad,
      position: beam.supportA.position,
      magnitude: fa,
    },
    {
      id: nanoid(),
      type: LoadType.PointLoad,
      position: beam.supportB.position,
      magnitude: fb,
    },
  ];
}

/**
 * 计算 x 处的剪力 F(x)
 * 规定：向上外力对左侧截面产生正剪力
 */
function getShear(x: number, loads: Load[]): number {
  let shear = 0;

  for (const load of loads) {
    switch (load.type) {
      case LoadType.PointLoad:
        if (load.position <= x) shear += load.magnitude;
        break;

      case LoadType.DistributedLoad: {
        const start = load.startPosition;
        if (x <= start) break;
        const end = load.endPosition;
        const overlap = Math.min(x, end) - start;
        shear += load.magnitude * overlap;
        break;
      }
      case LoadType.Moment:
        break;
    }
  }
  return shear;
}

/**
 * 计算 x 处的弯矩 M(x)
 * 规定：使梁下侧受拉的弯矩为正
 */
function getMoment(x: number, loads: Load[]): number {
  let moment = 0;

  for (const load of loads) {
    switch (load.type) {
      case LoadType.PointLoad:
        if (load.position <= x) {
          moment += load.magnitude * (x - load.position);
        }
        break;

      case LoadType.DistributedLoad: {
        const start = load.startPosition;
        const end = load.endPosition;
        if (x <= start || x >= end) break;

        const a = start;
        const b = Math.min(x, end);
        // 积分 ∫(x-ξ)·q dξ = q·[ (x-a)^2/2 - (x-b)^2/2 ]
        const term1 = (x - a) ** 2 / 2;
        const term2 = (x - b) ** 2 / 2;
        moment += load.magnitude * (term1 - term2);
        break;
      }

      case LoadType.Moment:
        if (load.position <= x) {
          moment += load.magnitude;
        }
        break;
    }
  }
  return moment;
}

/**
 * 收集关键位置（载荷位置、端点等）
 */
function collectKeyPositions(beamLength: number, loads: Load[]): number[] {
  const keyPositions = new Set<number>();
  keyPositions.add(0);
  keyPositions.add(beamLength);

  loads.forEach((load) => {
    switch (load.type) {
      case LoadType.PointLoad:
      case LoadType.Moment:
        keyPositions.add(load.position);
        break;
      case LoadType.DistributedLoad:
        keyPositions.add(load.startPosition);
        keyPositions.add(load.endPosition);
        break;
    }
  });

  return Array.from(keyPositions).sort((a, b) => a - b);
}

/**
 * 生成剪力图数据点（含突变处理）
 * - 对每个载荷位置（及端点）生成左、右极限点
 * - 相邻关键点之间按步长插值
 */
export function generateShearData(
  beamLength: number,
  loads: Load[],
  step: number = 0.05,
): { x: number; value: number }[] {
  const sortedPositions = collectKeyPositions(beamLength, loads);
  const shearData: { x: number; value: number }[] = [];

  // 按区间生成数据
  for (let i = 0; i < sortedPositions.length - 1; i++) {
    const left = sortedPositions[i];
    const right = sortedPositions[i + 1];

    // 左端点：对于非起始点，已经在上个区间添加过右极限，此处仅当 left === 0 时添加
    if (i === 0) {
      const sLeft = getShear(left, loads);
      shearData.push({ x: left, value: sLeft });
    }

    // 区间内部插值（不含右端点）
    for (let x = left + step; x < right - step / 2; x += step) {
      const s = getShear(x, loads);
      shearData.push({ x, value: s });
    }

    // 右端点：生成左极限和右极限（用于显示突变）
    const sRightMinus = getShear(right - 1e-9, loads);
    const sRightPlus = getShear(right + 1e-9, loads);

    // 先推入左极限
    shearData.push({ x: right, value: sRightMinus });

    // 如果存在突变（剪力左右极限不等），再推入右极限（同 x，不同 y）
    if (Math.abs(sRightPlus - sRightMinus) > 1e-6) {
      shearData.push({ x: right, value: sRightPlus });
    }
  }

  // 确保最后一个点有右极限（如果上一个循环未添加）
  const lastX = beamLength;
  const lastShear = getShear(lastX, loads);
  if (shearData[shearData.length - 1]?.x !== lastX) {
    shearData.push({ x: lastX, value: lastShear });
  }

  return shearData;
}

/**
 * 生成弯矩图数据点（含突变处理）
 * - 对每个载荷位置（及端点）生成左、右极限点
 * - 相邻关键点之间按步长插值
 */
export function generateMomentData(
  beamLength: number,
  loads: Load[],
  step: number = 0.05,
): { x: number; value: number }[] {
  const sortedPositions = collectKeyPositions(beamLength, loads);
  const momentData: { x: number; value: number }[] = [];

  // 按区间生成数据
  for (let i = 0; i < sortedPositions.length - 1; i++) {
    const left = sortedPositions[i];
    const right = sortedPositions[i + 1];

    // 左端点：对于非起始点，已经在上个区间添加过右极限，此处仅当 left === 0 时添加
    if (i === 0) {
      const mLeft = getMoment(left, loads);
      momentData.push({ x: left, value: mLeft });
    }

    // 区间内部插值（不含右端点）
    for (let x = left + step; x < right - step / 2; x += step) {
      const m = getMoment(x, loads);
      momentData.push({ x, value: m });
    }

    // 右端点：生成左极限和右极限（用于显示突变）
    const mRightMinus = getMoment(right - 1e-9, loads);
    const mRightPlus = getMoment(right + 1e-9, loads);

    // 先推入左极限
    momentData.push({ x: right, value: mRightMinus });

    // 如果存在突变（弯矩左右极限不等），再推入右极限（同 x，不同 y）
    if (Math.abs(mRightPlus - mRightMinus) > 1e-6) {
      momentData.push({ x: right, value: mRightPlus });
    }
  }

  // 确保最后一个点有右极限（如果上一个循环未添加）
  const lastX = beamLength;
  const lastMoment = getMoment(lastX, loads);
  if (momentData[momentData.length - 1]?.x !== lastX) {
    momentData.push({ x: lastX, value: lastMoment });
  }

  return momentData;
}
