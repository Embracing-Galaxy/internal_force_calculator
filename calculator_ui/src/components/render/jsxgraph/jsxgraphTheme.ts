export const JSXGRAPH_THEME = {
  labelColor: "#1e293b",
  axisColor: "#64748b",
  gridColor: "#e2e8f0",
  referenceColor: "#94a3b8",
  zeroLineColor: "#1e293b",
  shearColor: "#8884d8",
  momentColor: "#82ca9d",
  defaultBoardOptions: {
    showCopyright: false,
    showNavigation: false,
    pan: { enabled: false },
    zoom: false as const,
    keepAspectRatio: false,
  },
} as const;

export function getBoundingBox(
  data: { x: number; value: number }[],
  xMin: number,
  xMax: number,
  padding: number = 0.15,
): [number, number, number, number] {
  const values = data.map((d) => d.value);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);

  if (minY === maxY) {
    if (minY === 0) {
      return [xMin, 1, xMax, -1];
    }
    const range = Math.abs(minY) * padding || 1;
    return [xMin, maxY + range, xMax, minY - range];
  }

  const range = maxY - minY;
  const yMin = minY - range * padding;
  const yMax = maxY + range * padding;

  return [xMin, yMax, xMax, yMin];
}
