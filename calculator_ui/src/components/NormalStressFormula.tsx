import TeX from "@matejmazur/react-katex";
import type { PrincipalMomentsOutput } from "@/services";

type Vector3 = { x: number; y: number; z: number };

interface NormalStressFormulaProps {
  calculateResult: PrincipalMomentsOutput | null;
  force: Vector3;
  forcePoint: Vector3;
}

const FORMULA = String.raw`\sigma_{x} = \frac{F_{N}}{A}+\frac{M_{z}y}{I_{z}}+\frac{M_{y}z}{I_{y}}`;

export default function NormalStressFormula({
  calculateResult,
  force,
  forcePoint,
}: NormalStressFormulaProps) {
  if (!calculateResult) return null;
  const moveCenter =
    Math.abs(calculateResult.yc - 0) > 1e-5 &&
    Math.abs(calculateResult.zc - 0) > 1e-5;
  const rotated = Math.abs(calculateResult.theta) > 1e-5;
  const yc2 = calculateResult.yc.toFixed(2);
  const zc2 = calculateResult.zc.toFixed(2);
  const theta2 = ((calculateResult.theta * 180) / Math.PI).toFixed(2);
  const moveDesc = moveCenter ? `将原点移动到形心(0, ${yc2}, ${zc2}), ` : "";
  const rotateDesc = rotated
    ? String.raw`将坐标轴旋转 \theta = ${theta2} 度, `
    : "";
  const desc =
    moveCenter || rotated
      ? `${moveDesc}${rotateDesc}得到主轴`
      : "原坐标系即为主轴";
  return (
    <div className="flex flex-col gap-2">
      <TeX math={desc} />
      <TeX
        math={`I_{y}=${calculateResult.imax}, I_{z}=${calculateResult.imin}`}
      />
      <br />
      <TeX math={`根据公式${FORMULA}`} />
      <TeX>最终结果为: </TeX>
      <TeX
        math={getNormalStressFormula(
          calculateResult,
          force,
          forcePoint,
          moveCenter,
          rotated,
        )}
      />
    </div>
  );
}

function getNormalStressFormula(
  result: PrincipalMomentsOutput,
  force: Vector3,
  forcePoint: Vector3,
  moveCenter: boolean,
  rotated: boolean,
): string {
  const fx = force.x,
    fy = force.y,
    fz = force.z;
  const cos = Math.cos(result.theta);
  const sin = Math.sin(result.theta);
  const px = forcePoint.x;
  let py = forcePoint.y,
    pz = forcePoint.z;
  if (moveCenter) {
    py -= result.yc;
    pz -= result.zc;
  }
  if (rotated) {
    const pyNew = py * cos + pz * sin;
    const pzNew = -py * sin + pz * cos;
    py = pyNew;
    pz = pzNew;
  }
  // 外力简化到截面平面产生的弯矩:
  // M = r × F = (x,y,z) × (Fx,Fy,Fz)
  // My = Fx·z - Fz·x , Mz = Fy·x - Fx·y
  const my = pz * fx - px * fz;
  const mz = -py * fx + px * fy;

  return String.raw`\sigma_{x'} = ${fx / result.area} + ${mz / result.imin}y'+ ${my / result.imax}z'`;
}
