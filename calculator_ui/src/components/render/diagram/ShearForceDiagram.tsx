import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import { Load, Beam } from "@/types/beam";
import { generateShearData } from "@/lib/beam-calculations";

interface ShearForceDiagramProps {
    beam: Beam;
    loads: Load[];
    className?: string;
}

export function ShearForceDiagram({ beam, loads, className }: ShearForceDiagramProps) {
    const shearData = useMemo(
        () => generateShearData(beam.length, loads, beam.length / 200),
        [beam, loads]
    );

    return (
        <div className={cn("w-full h-[300px] mb-5", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={shearData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <ReferenceLine y={0} stroke="black" strokeWidth={1.5} />
                    <XAxis
                        dataKey="x"
                        type="number"
                        domain={[0, beam.length]}
                        axisLine={false}
                        label={{ value: 'x (m)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                        label={{ value: '剪力 (kN)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        formatter={(value) => typeof value === 'number' ? value.toFixed(3) : value}
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
};