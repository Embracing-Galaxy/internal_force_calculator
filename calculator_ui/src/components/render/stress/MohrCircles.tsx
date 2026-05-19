import { useEffect } from "react";
import { JSXGRAPH_THEME } from "@/components/render/jsxgraph/jsxgraphTheme";
import {
  createTooltip,
  hideTooltip,
  showTooltip,
  TOOLTIP_THRESHOLD_FACTOR,
} from "@/components/render/jsxgraph/jsxgraphTooltip";
import { useJsxGraphBoard } from "@/components/render/jsxgraph/useJsxGraphBoard";
import { cn, tex } from "@/lib/utils";

interface MohrCirclesProps {
  sigma1: number;
  sigma2: number;
  sigma3: number;
  className?: string;
}

/**
 * Interactive Mohr's circles diagram for 3D stress state.
 *
 * Displays three Mohr circles (σ₁-σ₂, σ₂-σ₃, σ₁-σ₃) along the σ axis
 * with hover tooltips showing (σ, τ) coordinates on each circle.
 */
export default function MohrCircles({
  sigma1,
  sigma2,
  sigma3,
  className,
}: MohrCirclesProps) {
  const { containerRef, initBoard } = useJsxGraphBoard();

  useEffect(() => {
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

    const board = initBoard({
      boundingbox: [xMin, yMax, xMax, yMin] as [number, number, number, number],
      axis: false,
      grid: false,
      keepAspectRatio: true,
      zoom: { wheel: false },
    });
    if (!board) return;

    // σ-axis (horizontal)
    board.create(
      "axis",
      [
        [xMin, 0],
        [xMax + padding * 0.2, 0],
      ],
      {
        strokeColor: JSXGRAPH_THEME.axisColor,
        strokeWidth: 1.5,
        lastArrow: true,
        fixed: true,
      },
    );

    // τ-axis (vertical)
    board.create(
      "axis",
      [
        [0, yMin],
        [0, yMax + padding * 0.2],
      ],
      {
        strokeColor: JSXGRAPH_THEME.axisColor,
        strokeWidth: 1.5,
        lastArrow: true,
        fixed: true,
      },
    );

    // Axis labels
    board.create("text", [xMax, -padding * 0.3, tex("\\sigma")], {
      display: "html",
      color: JSXGRAPH_THEME.labelColor,
      fixed: true,
      anchorX: "right",
      anchorY: "top",
    });
    board.create("text", [padding * 0.2, yMax, tex("\\tau")], {
      display: "html",
      color: JSXGRAPH_THEME.labelColor,
      fixed: true,
      anchorX: "left",
      anchorY: "middle",
    });

    // ── 3. Zero stress state guard ───────────────────────────────────
    const zeroStress = sigma1 === 0 && sigma2 === 0 && sigma3 === 0;

    if (zeroStress) {
      board.create("text", [0, 0, "Zero stress state"], {
        fontSize: 18,
        color: JSXGRAPH_THEME.labelColor,
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
        color: JSXGRAPH_THEME.axisColor,
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
        color: JSXGRAPH_THEME.axisColor,
        fixed: true,
        anchorX: "left",
        anchorY: "top",
      },
    );

    // --- Hover interaction: show tooltip with circle point coordinates ---
    const tooltipEl = createTooltip(board);

    const threshold = (xMax - xMin) * TOOLTIP_THRESHOLD_FACTOR;

    const handleMove = (e: Event) => {
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
          const tooltipStr = `(${px.toFixed(2)}, ${py.toFixed(2)})`;
          showTooltip(tooltipEl, tooltipX, tooltipY, tooltipStr);
          found = true;
          break;
        }
      }

      if (!found) {
        hideTooltip(tooltipEl);
      }
    };

    const handleOut = () => {
      hideTooltip(tooltipEl);
    };

    board.on("move", handleMove);
    board.on("out", handleOut);

    board.update();
  }, [sigma1, sigma2, sigma3, initBoard]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full overflow-hidden rounded-md", className)}
    />
  );
}
