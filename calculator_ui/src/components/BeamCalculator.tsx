import { useCallback, useState } from "react";
import { toast } from "sonner";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { BeamCanvas } from "@/components/render/BeamCanvas.tsx";
import { ShearForceDiagram } from "@/components/render/diagram/ShearForceDiagram";
import { BendingMomentDiagram } from "@/components/render/diagram/BendingMomentDiagram";
import BeamSettingsBar from "@/components/settings/beam/BeamSettingsBar.tsx";
import { Beam, Load, SolverError, SupportType } from "@/types/beam";
import { sumForces } from "@/lib/beam-calculations";

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
        <SidebarInset className="flex-1 h-screen">
          <SidebarTrigger className="-mr-1 ml-auto mt-1 rotate-180 z-10" />
          {!result ? (
            // 没有结果时，BeamCanvas 占满整个空间
            <BeamCanvas beam={beam} error={error} className="h-full" />
          ) : (
            // 有结果时，左右布局
            <div className="h-full flex">
              <BeamCanvas beam={beam} error={error} className="w-1/2 h-full" />
              <div className="w-1/2 h-full flex flex-col">
                <ShearForceDiagram beam={beam} loads={result} className="flex-1" />
                <BendingMomentDiagram beam={beam} loads={result} className="flex-1" />
              </div>
            </div>
          )}
        </SidebarInset >
        <BeamSettingsBar beam={beam} onBeamChange={setBeam} onCalculate={calculate} />
    </div>
  );
}
