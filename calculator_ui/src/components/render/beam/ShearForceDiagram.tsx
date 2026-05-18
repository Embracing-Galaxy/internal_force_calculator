import { useEffect, useState } from "react";
import JsxDiagram from "@/components/render/jsxgraph/JsxDiagram";
import { JSXGRAPH_THEME } from "@/components/render/jsxgraph/jsxgraphTheme";
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
      <JsxDiagram
        data={shearData}
        lineColor={JSXGRAPH_THEME.shearColor}
        yLabel="剪力 (kN)"
        beamLen={beamLen}
        yValueReversed={false}
      />
    </div>
  );
}
