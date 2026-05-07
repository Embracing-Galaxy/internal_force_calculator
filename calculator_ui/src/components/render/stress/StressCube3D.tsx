import { Grid, Html, Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import katex from "katex";
import { useMemo } from "react";
import { DoubleSide, Quaternion, Vector3 } from "three";
import type { PrincipalStressOutput } from "@/services";

// ─── Constants ───────────────────────────────────────────────────────────────

const CUBE_SIZE = 2;
const HALF_SIZE = CUBE_SIZE / 2;
const ARROW_SCALE = 0.15;
const MIN_ARROW_LENGTH = 0.05;
const MAX_ARROW_LENGTH = 1.5;

const COLORS = {
  tensile: "#3b82f6",
  compressive: "#ef4444",
  principalTensile: "#22c55e",
  principalCompressive: "#ef4444",
  cubeFace: "#ffffff",
  cubeEdge: "#0f172a",
  axisX: "#ef4444",
  axisY: "#22c55e",
  axisZ: "#3b82f6",
  grid: "#cbd5e1",
  text: "#0f172a",
};

// ─── KaTeX Helper ─────────────────────────────────────────────────────────────

const tex = (latex: string) =>
  katex.renderToString(latex, { throwOnError: false, displayMode: false });

// ─── Types ───────────────────────────────────────────────────────────────────

interface StressCube3DProps {
  /** Current 3x3 stress tensor from user input */
  tensor: number[][];
  /** Principal stress result from backend (null = no computation yet) */
  principalStresses: PrincipalStressOutput | null;
  /** Display mode */
  mode: "original" | "principal";
  /** CSS className for sizing */
  className?: string;
}

interface ArrowProps {
  origin: [number, number, number];
  direction: [number, number, number];
  length: number;
  color: string;
  label: string;
}

// ─── KaTeX Label in 3D ───────────────────────────────────────────────────────

function KaTeXLabel({
  position,
  latex,
  color,
  fontSize = 16,
}: {
  position: [number, number, number];
  latex: string;
  color: string;
  fontSize?: number;
}) {
  const html = useMemo(() => tex(latex), [latex]);
  return (
    <Html position={position} center zIndexRange={[40, 0]}>
      <span
        style={{
          color,
          fontSize: `${fontSize}px`,
          textShadow: "0 0 4px rgba(255,255,255,0.8)",
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX renders trusted HTML from LaTeX
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Html>
  );
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function clampArrowLength(value: number): number {
  if (Math.abs(value) < 0.001) return 0;
  const scaled = Math.abs(value) * ARROW_SCALE;
  const clamped = Math.min(
    Math.max(scaled, MIN_ARROW_LENGTH),
    MAX_ARROW_LENGTH,
  );
  return value > 0 ? clamped : -clamped;
}

function getArrowColor(value: number, isPrincipal: boolean): string {
  if (Math.abs(value) < 0.001) return "transparent";
  if (isPrincipal)
    return value > 0 ? COLORS.principalTensile : COLORS.principalCompressive;
  return value > 0 ? COLORS.tensile : COLORS.compressive;
}

// ─── 3D Sub-Components ──────────────────────────────────────────────────────

function StressArrow({ origin, direction, length, color, label }: ArrowProps) {
  // Hooks MUST be before early return
  const arrowQ = useMemo(() => {
    const sign = Math.sign(length);
    const dir = new Vector3(
      direction[0] * sign,
      direction[1] * sign,
      direction[2] * sign,
    );
    const up = new Vector3(0, 1, 0);
    if (dir.length() < 0.001) return new Quaternion();
    const normalized = dir.clone().normalize();
    if (normalized.y < -0.9999) {
      return new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI);
    }
    return new Quaternion().setFromUnitVectors(up, normalized);
  }, [direction, length]);

  if (Math.abs(length) < MIN_ARROW_LENGTH) return null;

  const absLength = Math.abs(length);
  const arrowDir: [number, number, number] = [
    direction[0] * Math.sign(length),
    direction[1] * Math.sign(length),
    direction[2] * Math.sign(length),
  ];

  const endPoint: [number, number, number] = [
    origin[0] + arrowDir[0] * absLength,
    origin[1] + arrowDir[1] * absLength,
    origin[2] + arrowDir[2] * absLength,
  ];

  return (
    <group>
      {/* Rotated arrow geometry group */}
      <group position={origin} quaternion={arrowQ}>
        {/* Arrow shaft — along local Y (which == arrowDir in world) */}
        <mesh position={[0, absLength / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, absLength, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Arrow head */}
        <mesh position={[0, absLength, 0]}>
          <coneGeometry args={[0.06, 0.15, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* Label (world-space, not rotated for readability) */}
      {label && (
        <KaTeXLabel
          position={[
            endPoint[0] + arrowDir[0] * 0.2,
            endPoint[1] + arrowDir[1] * 0.2,
            endPoint[2] + arrowDir[2] * 0.2,
          ]}
          latex={label}
          color={color}
          fontSize={16}
        />
      )}
    </group>
  );
}

function CoordinateAxes() {
  const axisLength = 2.5;
  return (
    <group>
      {/* X-axis */}
      <mesh position={[axisLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, axisLength, 8]} />
        <meshStandardMaterial color={COLORS.axisX} />
      </mesh>
      <mesh position={[axisLength, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.12, 8]} />
        <meshStandardMaterial color={COLORS.axisX} />
      </mesh>
      <Text
        position={[axisLength + 0.2, 0, 0]}
        fontSize={0.18}
        color={COLORS.axisX}
      >
        X
      </Text>

      {/* Y-axis */}
      <mesh position={[0, axisLength / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, axisLength, 8]} />
        <meshStandardMaterial color={COLORS.axisY} />
      </mesh>
      <mesh position={[0, axisLength, 0]}>
        <coneGeometry args={[0.05, 0.12, 8]} />
        <meshStandardMaterial color={COLORS.axisY} />
      </mesh>
      <Text
        position={[0, axisLength + 0.2, 0]}
        fontSize={0.18}
        color={COLORS.axisY}
      >
        Y
      </Text>

      {/* Z-axis */}
      <mesh position={[0, 0, axisLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, axisLength, 8]} />
        <meshStandardMaterial color={COLORS.axisZ} />
      </mesh>
      <mesh position={[0, 0, axisLength]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.12, 8]} />
        <meshStandardMaterial color={COLORS.axisZ} />
      </mesh>
      <Text
        position={[0, 0, axisLength + 0.2]}
        fontSize={0.18}
        color={COLORS.axisZ}
      >
        Z
      </Text>
    </group>
  );
}

function CubeFaces() {
  const facePositions: {
    pos: [number, number, number];
    rot: [number, number, number];
    key: string;
  }[] = [
    { pos: [HALF_SIZE, 0, 0], rot: [0, Math.PI / 2, 0], key: "+X" },
    { pos: [-HALF_SIZE, 0, 0], rot: [0, -Math.PI / 2, 0], key: "-X" },
    { pos: [0, HALF_SIZE, 0], rot: [-Math.PI / 2, 0, 0], key: "+Y" },
    { pos: [0, -HALF_SIZE, 0], rot: [Math.PI / 2, 0, 0], key: "-Y" },
    { pos: [0, 0, HALF_SIZE], rot: [0, 0, 0], key: "+Z" },
    { pos: [0, 0, -HALF_SIZE], rot: [0, Math.PI, 0], key: "-Z" },
  ];

  const h = HALF_SIZE;
  const cubeEdges: [number, number, number][][] = [
    // Bottom face
    [
      [-h, -h, -h],
      [h, -h, -h],
    ],
    [
      [h, -h, -h],
      [h, -h, h],
    ],
    [
      [h, -h, h],
      [-h, -h, h],
    ],
    [
      [-h, -h, h],
      [-h, -h, -h],
    ],
    // Top face
    [
      [-h, h, -h],
      [h, h, -h],
    ],
    [
      [h, h, -h],
      [h, h, h],
    ],
    [
      [h, h, h],
      [-h, h, h],
    ],
    [
      [-h, h, h],
      [-h, h, -h],
    ],
    // Vertical edges
    [
      [-h, -h, -h],
      [-h, h, -h],
    ],
    [
      [h, -h, -h],
      [h, h, -h],
    ],
    [
      [h, -h, h],
      [h, h, h],
    ],
    [
      [-h, -h, h],
      [-h, h, h],
    ],
  ];

  return (
    <group>
      {facePositions.map((face) => (
        <mesh key={face.key} position={face.pos} rotation={face.rot}>
          <planeGeometry args={[CUBE_SIZE, CUBE_SIZE]} />
          <meshStandardMaterial
            color={COLORS.cubeFace}
            transparent
            opacity={0.15}
            side={DoubleSide}
          />
        </mesh>
      ))}
      {/* Cube edges — thick lines via Line2 for cross-platform visibility */}
      {cubeEdges.map((points) => (
        <Line
          key={`edge-${points[0].join(",")}-${points[1].join(",")}`}
          points={points}
          color={COLORS.cubeEdge}
          lineWidth={2}
        />
      ))}
    </group>
  );
}

function OriginalStressArrows({ tensor }: { tensor: number[][] }) {
  const [[sigma_x, tau_xy, tau_xz], [, sigma_y, tau_yz], [, , sigma_z]] =
    tensor;

  const arrows: ArrowProps[] = [];

  function tryAddArrow(
    faceCenter: [number, number, number],
    dir: [number, number, number],
    value: number,
    label: string,
  ) {
    const len = clampArrowLength(value);
    if (len === 0) return;
    const sign = Math.sign(len);
    const absLen = Math.abs(len);
    arrows.push({
      origin: [
        faceCenter[0] + (dir[0] * sign * absLen) / 2,
        faceCenter[1] + (dir[1] * sign * absLen) / 2,
        faceCenter[2] + (dir[2] * sign * absLen) / 2,
      ],
      direction: dir,
      length: len,
      color: getArrowColor(value, false),
      label,
    });
  }

  // +X face
  tryAddArrow([HALF_SIZE, 0, 0], [1, 0, 0], sigma_x, "\\sigma_x");
  tryAddArrow([HALF_SIZE, 0, 0], [0, 1, 0], tau_xy, "\\tau_{xy}");
  tryAddArrow([HALF_SIZE, 0, 0], [0, 0, 1], tau_xz, "\\tau_{xz}");

  // -X face (reversed normals)
  tryAddArrow([-HALF_SIZE, 0, 0], [-1, 0, 0], sigma_x, "\\sigma_x");
  tryAddArrow([-HALF_SIZE, 0, 0], [0, -1, 0], tau_xy, "\\tau_{xy}");
  tryAddArrow([-HALF_SIZE, 0, 0], [0, 0, -1], tau_xz, "\\tau_{xz}");

  // +Y face
  tryAddArrow([0, HALF_SIZE, 0], [0, 1, 0], sigma_y, "\\sigma_y");
  tryAddArrow([0, HALF_SIZE, 0], [1, 0, 0], tau_xy, "\\tau_{yx}");
  tryAddArrow([0, HALF_SIZE, 0], [0, 0, 1], tau_yz, "\\tau_{yz}");

  // -Y face
  tryAddArrow([0, -HALF_SIZE, 0], [0, -1, 0], sigma_y, "\\sigma_y");
  tryAddArrow([0, -HALF_SIZE, 0], [-1, 0, 0], tau_xy, "\\tau_{yx}");
  tryAddArrow([0, -HALF_SIZE, 0], [0, 0, -1], tau_yz, "\\tau_{yz}");

  // +Z face
  tryAddArrow([0, 0, HALF_SIZE], [0, 0, 1], sigma_z, "\\sigma_z");
  tryAddArrow([0, 0, HALF_SIZE], [1, 0, 0], tau_xz, "\\tau_{zx}");
  tryAddArrow([0, 0, HALF_SIZE], [0, 1, 0], tau_yz, "\\tau_{zy}");

  // -Z face
  tryAddArrow([0, 0, -HALF_SIZE], [0, 0, -1], sigma_z, "\\sigma_z");
  tryAddArrow([0, 0, -HALF_SIZE], [-1, 0, 0], tau_xz, "\\tau_{zx}");
  tryAddArrow([0, 0, -HALF_SIZE], [0, -1, 0], tau_yz, "\\tau_{zy}");

  return (
    <group>
      {arrows.map((arrow) => (
        <StressArrow
          key={`${arrow.label}-${arrow.origin.join(",")}-${arrow.direction.join(",")}`}
          {...arrow}
        />
      ))}
    </group>
  );
}

function PrincipalStressArrows({
  principalStresses,
}: {
  principalStresses: PrincipalStressOutput;
}) {
  const { sigma_1, sigma_2, sigma_3 } = principalStresses;

  // Use cube-local axes — the containing <group> is rotated so that
  // local X→direction_1, local Y→direction_2, local Z→direction_3.
  const principalData = [
    {
      value: sigma_1,
      dir: [1, 0, 0] as [number, number, number],
      label: "\\sigma_1",
    },
    {
      value: sigma_2,
      dir: [0, 1, 0] as [number, number, number],
      label: "\\sigma_2",
    },
    {
      value: sigma_3,
      dir: [0, 0, 1] as [number, number, number],
      label: "\\sigma_3",
    },
  ];

  const arrows: ArrowProps[] = [];

  for (const { value, dir, label } of principalData) {
    const len = clampArrowLength(value);
    if (len === 0) continue;

    const absLen = Math.abs(len);
    const sign = Math.sign(len);

    arrows.push({
      origin: [
        dir[0] * (HALF_SIZE + (sign * absLen) / 2),
        dir[1] * (HALF_SIZE + (sign * absLen) / 2),
        dir[2] * (HALF_SIZE + (sign * absLen) / 2),
      ],
      direction: [dir[0] * sign, dir[1] * sign, dir[2] * sign],
      length: absLen,
      color: getArrowColor(value, true),
      label,
    });
  }

  return (
    <group>
      {arrows.map((arrow) => (
        <StressArrow key={`principal-${arrow.label}`} {...arrow} />
      ))}
    </group>
  );
}

function SceneContent({
  tensor,
  principalStresses,
  mode,
}: {
  tensor: number[][];
  principalStresses: PrincipalStressOutput | null;
  mode: "original" | "principal";
}) {
  // Compute rotation matrix for principal mode
  const principalRotation = useMemo(() => {
    if (mode !== "principal" || !principalStresses) return null;

    const { direction_1, direction_2, direction_3 } = principalStresses;
    // Create rotation matrix from eigenvectors
    return [
      [direction_1[0], direction_2[0], direction_3[0]],
      [direction_1[1], direction_2[1], direction_3[1]],
      [direction_1[2], direction_2[2], direction_3[2]],
    ] as number[][];
  }, [mode, principalStresses]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      <CoordinateAxes />

      {/* Ground grid */}
      <Grid
        position={[0, -HALF_SIZE - 0.5, 0]}
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.5}
        sectionSize={1}
        sectionThickness={1}
        fadeDistance={15}
        fadeStrength={2}
        material-color={COLORS.grid}
      />

      {/* Cube with rotation for principal mode */}
      <group
        rotation={
          principalRotation
            ? [
                Math.atan2(principalRotation[2][1], principalRotation[2][2]),
                Math.atan2(
                  -principalRotation[2][0],
                  Math.sqrt(
                    principalRotation[2][1] ** 2 + principalRotation[2][2] ** 2,
                  ),
                ),
                Math.atan2(principalRotation[1][0], principalRotation[0][0]),
              ]
            : [0, 0, 0]
        }
      >
        <CubeFaces />

        {mode === "original" && <OriginalStressArrows tensor={tensor} />}
        {mode === "principal" && principalStresses && (
          <PrincipalStressArrows principalStresses={principalStresses} />
        )}
      </group>

      {/* Principal axes labels */}
      {mode === "principal" && principalRotation && (
        <group>
          <KaTeXLabel
            position={[
              principalRotation[0][0] * 3,
              principalRotation[1][0] * 3,
              principalRotation[2][0] * 3,
            ]}
            latex="\sigma_1\ \text{direction}"
            color={COLORS.principalTensile}
            fontSize={16}
          />
          <KaTeXLabel
            position={[
              principalRotation[0][1] * 3,
              principalRotation[1][1] * 3,
              principalRotation[2][1] * 3,
            ]}
            latex="\sigma_2\ \text{direction}"
            color={COLORS.principalTensile}
            fontSize={16}
          />
          <KaTeXLabel
            position={[
              principalRotation[0][2] * 3,
              principalRotation[1][2] * 3,
              principalRotation[2][2] * 3,
            ]}
            latex="\sigma_3\ \text{direction}"
            color={COLORS.principalTensile}
            fontSize={16}
          />
        </group>
      )}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
      />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StressCube3D({
  tensor,
  principalStresses,
  mode,
  className,
}: StressCube3DProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [5, 4, 5], fov: 50 }}
        style={{ background: "#f8fafc" }}
        dpr={[1, 2]}
      >
        <SceneContent
          tensor={tensor}
          principalStresses={principalStresses}
          mode={mode}
        />
      </Canvas>
    </div>
  );
}
