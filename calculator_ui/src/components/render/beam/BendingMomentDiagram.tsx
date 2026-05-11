import { useEffect, useState } from "react";
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
import { calculatorService, type DataPoint, type LoadTypeRS } from "@/services";

interface BendingMomentDiagramProps {
  beamLen: number;
  loads: LoadTypeRS[];
}

export default function BendingMomentDiagram({
  beamLen,
  loads,
}: BendingMomentDiagramProps) {
  const [momentData, setMomentData] = useState<DataPoint[]>([]);

  useEffect(() => {
    calculatorService
      .generateMomentData(beamLen, loads, beamLen / 200)
      .then((data) => {
        setMomentData(data);
      });
  }, [beamLen, loads]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={momentData}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <ReferenceLine y={0} stroke="black" strokeWidth={1.5} />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, beamLen]}
            axisLine={false}
            label={{ value: "x (m)", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{ value: "弯矩 (kN·m)", angle: -90, position: "insideLeft" }}
            reversed={true}
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
            stroke="#82ca9d"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
