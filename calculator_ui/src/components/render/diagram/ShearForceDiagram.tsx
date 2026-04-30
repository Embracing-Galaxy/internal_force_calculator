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

interface ShearForceDiagramProps {
  beamLen: number;
  loads: LoadTypeRS[];
}

export default function ShearForceDiagram({
  beamLen,
  loads,
}: ShearForceDiagramProps) {
  const [shearData, setShearData] = useState<DataPoint[]>([]);

  useEffect(() => {
    calculatorService.generateShearData(beamLen, loads).then((data) => {
      setShearData(data);
    });
  }, [beamLen, loads]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={shearData}
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
    </div>
  );
}
