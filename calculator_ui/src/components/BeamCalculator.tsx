import { useCallback, useState } from "react";
import { toast } from "sonner";
import BeamCanvas from "@/components/render/BeamCanvas";
import BendingMomentDiagram from "@/components/render/diagram/BendingMomentDiagram";
import ShearForceDiagram from "@/components/render/diagram/ShearForceDiagram";
import BeamSettingsBar from "@/components/settings/beam/BeamSettingsBar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { calculatorService, type LoadTypeRS } from "@/services";
import { type Beam, SupportType } from "@/types/beam";

export default function BeamCalculator() {
  const isMobile = useIsMobile();
  const [beam, setBeam] = useState<Beam>({
    length: 0,
    supportA: { position: 0, type: SupportType.Hinge },
    supportB: { position: 0.1, type: SupportType.Roller },
    loads: [],
  });

  const [combinedLoads, setCombinedLoads] = useState<LoadTypeRS[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async () => {
    setError(null);

    try {
      setCombinedLoads(await calculatorService.getCombinedLoads(beam));
      toast.success("计算完成");
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
        {!combinedLoads ? (
          <BeamCanvas beam={beam} error={error} className="h-full" />
        ) : (
          <ResizablePanelGroup
            orientation={isMobile ? "vertical" : "horizontal"}
          >
            <ResizablePanel defaultSize={isMobile ? "25%" : "50%"}>
              <BeamCanvas beam={beam} error={error} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel
                  defaultSize="50%"
                  style={{ position: "relative" }}
                >
                  <ShearForceDiagram beam={beam} loads={combinedLoads} />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  defaultSize="50%"
                  style={{ position: "relative" }}
                >
                  <BendingMomentDiagram beam={beam} loads={combinedLoads} />
                </ResizablePanel>
              </ResizablePanelGroup>
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
