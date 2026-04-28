import { useCallback, useState } from "react";
import { toast } from "sonner";
import NormalStressFormula from "@/components/NormalStressFormula";
import SectionSettingsBar from "@/components/settings/normal/SectionSettingsBar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { calculatorService, type PrincipalMomentsOutput } from "@/services";

export default function NormalStressCalculator() {
  const [formula, setFormula] = useState("");
  const [force, setForce] = useState({ x: 0, y: 0, z: 0 });
  const [forcePoint, setForcePoint] = useState({ x: 0, y: 0, z: 0 });
  const [results, setResults] = useState<PrincipalMomentsOutput | null>(null);
  const calculate = useCallback(async () => {
    try {
      const result = await calculatorService.getPrincipalMoments(
        formula,
        400,
        400,
      );
      toast.success("计算成功");
      setResults(result);
    } catch (e) {
      toast.error(`计算出错 ${e}`);
    }
  }, [formula]);

  return (
    <div className="flex w-full h-screen">
      <main className="flex-1 relative h-screen">
        <SidebarTrigger className="absolute top-1 right-1 rotate-180 z-10" />
        <NormalStressFormula
          calculateResult={results}
          force={force}
          forcePoint={forcePoint}
        />
      </main>

      <SectionSettingsBar
        onChangeFormula={setFormula}
        onChangeForceX={(value) => setForce((prev) => ({ ...prev, x: value }))}
        onChangeForceY={(value) => setForce((prev) => ({ ...prev, y: value }))}
        onChangeForceZ={(value) => setForce((prev) => ({ ...prev, z: value }))}
        onChangeForcePointX={(value) =>
          setForcePoint((prev) => ({ ...prev, x: value }))
        }
        onChangeForcePointY={(value) =>
          setForcePoint((prev) => ({ ...prev, y: value }))
        }
        onChangeForcePointZ={(value) =>
          setForcePoint((prev) => ({ ...prev, z: value }))
        }
        onCalculate={calculate}
      />
    </div>
  );
}
