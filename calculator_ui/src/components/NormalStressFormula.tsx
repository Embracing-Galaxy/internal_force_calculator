import TeX from "@matejmazur/react-katex";
import type { PrincipalMomentsOutput } from "@/services";

type Vector3 = { x: number; y: number; z: number };
type Vector2 = { y: number; z: number };

interface NormalStressFormulaProps {
  calculateResult: PrincipalMomentsOutput | null;
  force: Vector3;
  forcePoint: Vector2;
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
  forcePoint: Vector2,
  moveCenter: boolean,
  rotated: boolean,
): string {
  const fx = force.x;
  const cos = Math.cos(result.theta);
  const sin = Math.sin(result.theta);
  let py = forcePoint.y,
    pz = forcePoint.z;
  if (moveCenter) {
    py -= forcePoint.y;
    pz -= forcePoint.z;
  }
  if (rotated) {
    py = py * cos + pz * sin;
    pz = -py * sin + pz * cos;
  }
  const my = pz * fx;
  const mz = -py * fx;

  return String.raw`\sigma_{x'} = ${fx / result.area} + ${mz / result.imin}y'+ ${my / result.imax}z'`;
}
