import { useEffect, useRef } from "react";
import {
  getBoundingBox,
  JSXGRAPH_THEME,
} from "@/components/render/jsxgraph/jsxgraphTheme";
import {
  createTooltip,
  hideTooltip,
  showTooltip,
  TOOLTIP_THRESHOLD_FACTOR,
} from "@/components/render/jsxgraph/jsxgraphTooltip";
import { useJsxGraphBoard } from "@/components/render/jsxgraph/useJsxGraphBoard";
import { cn } from "@/lib/utils";
import type { DataPoint } from "@/services";

interface JsxDiagramProps {
  data: DataPoint[];
  lineColor: string;
  yLabel: string;
  xLabel?: string;
  beamLen: number;
  yValueReversed?: boolean;
  className?: string;
}

export default function JsxDiagram({
  data,
  lineColor,
  yLabel,
  xLabel = "x (m)",
  beamLen,
  yValueReversed = false,
  className,
}: JsxDiagramProps) {
  const { containerRef, initBoard } = useJsxGraphBoard();
  /** Store the last computed yMin/yMax so the tooltip handler can access them
   *  without being a dependency of the effect. */
  const yBoundsRef = useRef({ yMin: 0, yMax: 0 });

  useEffect(() => {
    const board = initBoard();
    if (!board) return;

    const sorted = data
      .map((d) => ({ x: d.x, value: yValueReversed ? -d.value : d.value }))
      .sort((a, b) => a.x - b.x);

    const [xMin, yMax, xMax, yMin] =
      sorted.length > 0
        ? getBoundingBox(sorted, 0, beamLen)
        : ([0, 1, beamLen, -1] as [number, number, number, number]);

    yBoundsRef.current = { yMin, yMax };

    board.setBoundingBox([xMin, yMax, xMax, yMin]);

    const yRange = yMax - yMin;

    // X-axis (at y = 0)
    const xAxisEnd = beamLen + yRange * 0.03;
    const xAxis = board.create(
      "axis",
      [
        [0, 0],
        [xAxisEnd, 0],
      ],
      {
        strokeColor: JSXGRAPH_THEME.axisColor,
        strokeWidth: 1.5,
        lastArrow: true,
        fixed: true,
      },
    );

    // Y-axis (at x = 0)
    // Arrow points in the direction of positive value.
    // When yValueReversed, positive values are rendered downward,
    // so the arrow should point down as well.
    const yAxisExt = yRange * 0.05;
    const yAxis = board.create(
      "axis",
      yValueReversed
        ? [
            [0, yMax],
            [0, yMin - yAxisExt],
          ]
        : [
            [0, yMin],
            [0, yMax + yAxisExt],
          ],
      {
        strokeColor: JSXGRAPH_THEME.axisColor,
        strokeWidth: 1.5,
        lastArrow: true,
        fixed: true,
      },
    );

    //Grid (requires x/y axes as parents)
    board.create("grid", [xAxis, yAxis], {
      majorStep: [10, 8],
      strokeColor: JSXGRAPH_THEME.gridColor,
      strokeWidth: 0.5,
      fixed: true,
    });

    // Axis labels
    // X-axis label at the right end
    board.create("text", [beamLen, yMin - yRange * 0.06, xLabel], {
      display: "html",
      color: JSXGRAPH_THEME.labelColor,
      fixed: true,
      anchorX: "right",
      anchorY: "top",
    });

    // Y-axis label at the top
    board.create("text", [-(yRange * 0.055), yMax, yLabel], {
      display: "html",
      color: JSXGRAPH_THEME.labelColor,
      fixed: true,
      anchorX: "right",
      anchorY: "middle",
    });

    // Zero reference line (y = 0)
    board.create(
      "line",
      [
        [0, 0],
        [beamLen, 0],
      ],
      {
        strokeColor: JSXGRAPH_THEME.zeroLineColor,
        strokeWidth: 1,
        dash: 2,
        fixed: true,
      },
    );

    // Data curve
    if (sorted.length > 1) {
      const xs = sorted.map((d) => d.x);
      const ys = sorted.map((d) => d.value);
      board.create("curve", [xs, ys], {
        curveType: "plot",
        strokeColor: lineColor,
        strokeWidth: 2.5,
        fixed: true,
      });
    } else if (sorted.length === 1) {
      const pt = sorted[0];
      board.create("point", [pt.x, pt.value], {
        color: lineColor,
        size: 3,
        fixed: true,
        withLabel: false,
      });
    }

    // Tooltip (shared text element for hover display)
    const tooltipEl = createTooltip(board);

    const threshold = beamLen * TOOLTIP_THRESHOLD_FACTOR;

    const handleMove = (e: Event) => {
      const evt = e as PointerEvent;
      const [ux] = board.getUsrCoordsOfMouse(evt);

      if (sorted.length === 0) return;

      // Find nearest data point by x-distance
      let nearestIdx = 0;
      let nearestDist = Math.abs(sorted[0].x - ux);
      for (let i = 1; i < sorted.length; i++) {
        const dist = Math.abs(sorted[i].x - ux);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      if (nearestDist < threshold) {
        const pt = sorted[nearestIdx];
        const { yMin: yMinB, yMax: yMaxB } = yBoundsRef.current;
        const yRng = yMaxB - yMinB;
        const tooltipX = pt.x + yRng * 0.02;
        const tooltipY = pt.value + yRng * 0.02;

        showTooltip(
          tooltipEl,
          tooltipX,
          tooltipY,
          `(${pt.x.toFixed(2)}, ${pt.value.toFixed(2)})`,
        );
      } else {
        hideTooltip(tooltipEl);
      }
    };

    const handleOut = () => {
      hideTooltip(tooltipEl);
    };

    board.on("move", handleMove);
    board.on("out", handleOut);

    board.update();
  }, [data, lineColor, yLabel, xLabel, beamLen, yValueReversed, initBoard]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full overflow-hidden rounded-md", className)}
    />
  );
}
