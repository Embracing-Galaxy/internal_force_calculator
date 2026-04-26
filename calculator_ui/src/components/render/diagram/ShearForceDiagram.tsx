import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateShearData } from "@/lib/beam-calculations";
import type { Beam, Load } from "@/types/beam";

interface ShearForceDiagramProps {
  beam: Beam;
  loads: Load[];
}

export default function ShearForceDiagram({
  beam,
  loads,
}: ShearForceDiagramProps) {
  const shearData = useMemo(
    () => generateShearData(beam.length, loads, beam.length / 200),
    [beam, loads],
  );

  return (
    <ResponsiveContainer width="100%" height="100%" className="overflow-hidden">
      <LineChart
        data={shearData}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <ReferenceLine y={0} stroke="black" strokeWidth={1.5} />
        <XAxis
          dataKey="x"
          type="number"
          domain={[0, beam.length]}
          axisLine={false}
          label={{ value: "x (m)", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          label={{ value: "剪力 (kN)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          formatter={(value) =>
            typeof value === "number" ? value.toFixed(3) : value
          }
          labelFormatter={(label) => `x = ${Number(label).toFixed(3)} m`}
        />
        <ReferenceLine y={0} stroke="gray" strokeDasharray="5 5" />
        <Line
          type="linear"
          dataKey="value"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
