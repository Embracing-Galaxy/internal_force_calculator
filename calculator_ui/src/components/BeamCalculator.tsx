import { useCallback, useState } from "react";
import { toast } from "sonner";
import { BeamCanvas } from "@/components/render/BeamCanvas";
import { BendingMomentDiagram } from "@/components/render/diagram/BendingMomentDiagram";
import { ShearForceDiagram } from "@/components/render/diagram/ShearForceDiagram";
import BeamSettingsBar from "@/components/settings/beam/BeamSettingsBar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { sumForces } from "@/lib/beam-calculations";
import {
  type Beam,
  type Load,
  type SolverError,
  SupportType,
} from "@/types/beam";

export default function BeamCalculator() {
  const [beam, setBeam] = useState<Beam>({
    length: 0,
    supportA: { position: 0, type: SupportType.None },
    supportB: { position: 0.1, type: SupportType.None },
    loads: [],
  });

  const [result, setResult] = useState<Load[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async () => {
    setError(null);

    try {
      const response = await sumForces(beam);

      if ("type" in response) {
        const err = response as SolverError;
        setError(err.message);
        toast.error(`计算失败: ${err.message}`);
        setResult(null);
      } else {
        setResult(response as Load[]);
        toast.success("计算完成");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误";
      setError(msg);
      toast.error("计算出错", { description: msg });
    }
  }, [beam]);

  return (
    <div className="flex w-full">
      <main className="flex-1 relative h-screen">
        <SidebarTrigger className="absolute top-1 right-1 rotate-180 z-10" />
        {!result ? (
          // 没有结果时，BeamCanvas 占满整个空间
          <BeamCanvas beam={beam} error={error} className="h-full" />
        ) : (
          // 有结果时，左右布局
          <ResizablePanelGroup>
            <ResizablePanel defaultSize="50%">
              <BeamCanvas beam={beam} error={error} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="50%" className="flex flex-col">
              <ShearForceDiagram
                beam={beam}
                loads={result}
                className="flex-1"
              />
              <BendingMomentDiagram
                beam={beam}
                loads={result}
                className="flex-1"
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </main>
      <BeamSettingsBar
        beam={beam}
        onBeamChange={setBeam}
        onCalculate={calculate}
      />
    </div>
  );
}
