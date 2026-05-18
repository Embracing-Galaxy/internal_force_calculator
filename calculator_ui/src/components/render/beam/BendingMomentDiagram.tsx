import { useEffect, useState } from "react";
import JsxDiagram from "@/components/render/jsxgraph/JsxDiagram";
import { JSXGRAPH_THEME } from "@/components/render/jsxgraph/jsxgraphTheme";
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
      <JsxDiagram
        data={momentData}
        lineColor={JSXGRAPH_THEME.momentColor}
        yLabel="弯矩 (kN·m)"
        beamLen={beamLen}
        yValueReversed={true}
      />
    </div>
  );
}
