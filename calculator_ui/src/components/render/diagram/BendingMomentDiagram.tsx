import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { Load, Beam } from "@/types/beam";
import { generateMomentData } from "@/lib/beam-calculations";

interface BendingMomentDiagramProps {
    beam: Beam;
    loads: Load[];
    className?: string;
}

export function BendingMomentDiagram({ beam, loads, className }: BendingMomentDiagramProps) {
    const momentData = useMemo(
        () => generateMomentData(beam.length, loads, beam.length / 200),
        [beam, loads]
    );

    return (
        <div className={cn("w-full h-[300px]", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={momentData}
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
                        label={{ value: '弯矩 (kN·m)', angle: -90, position: 'insideLeft' }}
                        reversed={true}
                    />
                    <Tooltip
                        formatter={(value) => typeof value === 'number' ? value.toFixed(3) : value}
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
};