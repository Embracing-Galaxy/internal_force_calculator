import JXG from "jsxgraph";
import katex from "katex";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const tex = (latex: string) =>
  katex.renderToString(latex, { throwOnError: false, displayMode: false });

interface MohrCirclesProps {
  sigma1: number;
  sigma2: number;
  sigma3: number;
  className?: string;
}

export default function MohrCircles({
  sigma1,
  sigma2,
  sigma3,
  className,
}: MohrCirclesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<ReturnType<typeof JXG.JSXGraph.initBoard> | null>(
    null,
  );
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous board
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
      boardRef.current = null;
    }

    const labelColor = "#1e293b";
    const axisColor = "#64748b";
    const bgColor = "#ffffff";

    const maxAbs = Math.max(
      Math.abs(sigma1),
      Math.abs(sigma2),
      Math.abs(sigma3),
      Math.abs(sigma1 - sigma3) / 2,
    );
    const padding = maxAbs * 0.3 || 1;
    const xMin = Math.min(0, sigma3) - padding;
    const xMax = Math.max(0, sigma1) + padding;
    const tauMaxY = Math.abs(sigma1 - sigma3) / 2;
    const yMax = tauMaxY + 0.5;
    const yMin = -yMax;

    // Set background color on container
    containerRef.current.style.backgroundColor = bgColor;

    const board = JXG.JSXGraph.initBoard(containerRef.current, {
      boundingbox: [xMin, yMax, xMax, yMin] as [number, number, number, number],
      axis: false,
      grid: false,
      showCopyright: false,
      showNavigation: false,
      pan: { enabled: false },
      zoom: { wheel: false },
      keepAspectRatio: true,
    });

    boardRef.current = board;

    // --- Draw axes manually ---
    // sigma-axis
    board.create(
      "axis",
      [
        [xMin, 0],
        [xMax + padding * 0.2, 0],
      ],
      {
        strokeColor: axisColor,
        strokeWidth: 1.5,
        lastArrow: true,
        fixed: true,
      },
    );

    // tau-axis
    board.create(
      "axis",
      [
        [0, yMin],
        [0, yMax + padding * 0.2],
      ],
      {
        strokeColor: axisColor,
        strokeWidth: 1.5,
        lastArrow: true,
        fixed: true,
      },
    );

    // Axis labels
    board.create("text", [xMax, -padding * 0.3, tex("\\sigma")], {
      display: "html",
      color: labelColor,
      fixed: true,
      anchorX: "right",
      anchorY: "top",
    });
    board.create("text", [padding * 0.2, yMax, tex("\\tau")], {
      display: "html",
      color: labelColor,
      fixed: true,
      anchorX: "left",
      anchorY: "middle",
    });

    const zeroStress = sigma1 === 0 && sigma2 === 0 && sigma3 === 0;

    if (zeroStress) {
      board.create("text", [0, 0, "Zero stress state"], {
        fontSize: 18,
        color: labelColor,
        fixed: true,
        anchorX: "middle",
        anchorY: "middle",
      });
      board.update();
      return;
    }

    // --- Mohr circles ---
    const circleData = [
      {
        cx: (sigma1 + sigma2) / 2,
        r: Math.abs(sigma1 - sigma2) / 2,
        color: "#3b82f6",
      },
      {
        cx: (sigma2 + sigma3) / 2,
        r: Math.abs(sigma2 - sigma3) / 2,
        color: "#22c55e",
      },
      {
        cx: (sigma1 + sigma3) / 2,
        r: Math.abs(sigma1 - sigma3) / 2,
        color: "#ef4444",
      },
    ];

    for (const data of circleData) {
      if (data.r === 0) {
        board.create("point", [data.cx, 0], {
          name: "",
          color: data.color,
          size: 2,
          fixed: true,
        });
      } else {
        board.create("circle", [[data.cx, 0], data.r], {
          strokeColor: data.color,
          strokeWidth: 2,
          fillColor: data.color,
          fillOpacity: 0,
          fixed: true,
        });
      }
    }

    // --- Stress points (sigma1, sigma2, sigma3) ---
    const stressPoints = [
      { val: sigma1, latex: "\\sigma_1" },
      { val: sigma2, latex: "\\sigma_2" },
      { val: sigma3, latex: "\\sigma_3" },
    ];

    const yValOff = (yMax - yMin) * 0.08;

    for (const p of stressPoints) {
      board.create("point", [p.val, 0], {
        name: tex(p.latex),
        color: "#f59e0b",
        size: 3,
        fixed: true,
        label: {
          display: "html",
          anchorX: "middle",
          anchorY: "top",
        },
      });
      board.create("text", [p.val, -yValOff, p.val.toFixed(2)], {
        fontSize: 10,
        color: axisColor,
        fixed: true,
        anchorX: "middle",
        anchorY: "top",
      });
    }

    // --- taumax marker ---
    const tmX = (sigma1 + sigma3) / 2;
    const tmY = Math.abs(sigma1 - sigma3) / 2;

    board.create("point", [tmX, tmY], {
      name: tex("\\tau_{\\max}"),
      color: "#f59e0b",
      size: 3,
      fixed: true,
      label: {
        display: "html",
        anchorX: "left",
        anchorY: "bottom",
      },
    });
    board.create(
      "text",
      [tmX + padding * 0.08, tmY - padding * 0.04, tmY.toFixed(2)],
      {
        fontSize: 10,
        color: axisColor,
        fixed: true,
        anchorX: "left",
        anchorY: "top",
      },
    );

    // --- Hover interaction: show tooltip with circle point coordinates ---
    const coordTooltip = board.create("text", [1e10, 1e10, ""], {
      display: "html",
      fontSize: 15,
      color: "#334155",
      fixed: true,
      anchorX: "left",
      anchorY: "bottom",
    });

    const threshold = padding * 0.04;

    board.on("move", (e: Event) => {
      const evt = e as PointerEvent;
      const [ux, uy] = board.getUsrCoordsOfMouse(evt);

      let found = false;

      for (const c of circleData) {
        if (c.r === 0) continue;
        const dx = ux - c.cx;
        const dy = uy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const distOff = Math.abs(dist - c.r);

        if (distOff < threshold) {
          const angle = Math.atan2(dy, dx);
          const px = c.cx + c.r * Math.cos(angle);
          const py = c.r * Math.sin(angle);

          const tooltipX = px + padding * 0.04;
          const tooltipY = py + padding * 0.04;
          const tooltipStr = tex(
            `(\\sigma, \\tau) = (${px.toFixed(2)}, ${py.toFixed(2)})`,
          );
          coordTooltip.setPosition(JXG.COORDS_BY_USER, [tooltipX, tooltipY]);
          coordTooltip.setText(tooltipStr);
          found = true;
          break;
        }
      }

      if (!found) {
        coordTooltip.setPosition(JXG.COORDS_BY_USER, [1e10, 1e10]);
        coordTooltip.setText("");
      }
    });

    board.on("out", () => {
      coordTooltip.setPosition(JXG.COORDS_BY_USER, [1e10, 1e10]);
      coordTooltip.setText("");
    });

    board.update();
  }, [sigma1, sigma2, sigma3]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full overflow-hidden rounded-md", className)}
    />
  );
}
