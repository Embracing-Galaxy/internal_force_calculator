import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import StressStateSidebar from "@/components/settings/stress/StressStateSidebar.tsx";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { calculatorService, type PrincipalStressOutput } from "@/services";
import type { DisplayMode } from "@/types/stress-state";

const MohrCircles = lazy(
  () => import("@/components/render/stress/MohrCircles"),
);
const StressCube3D = lazy(
  () => import("@/components/render/stress/StressCube3D"),
);

/** Map (row, col) of a 3x3 symmetric tensor into the 6-component flat index. */
function tensorIndex(row: number, col: number): number {
  const idx: Record<string, number> = {
    "0,0": 0, // σxx
    "1,1": 1, // σyy
    "2,2": 2, // σzz
    "0,1": 3,
    "1,0": 3, // σxy
    "0,2": 4,
    "2,0": 4, // σxz
    "1,2": 5,
    "2,1": 5, // σyz
  };
  return idx[`${row},${col}`] ?? 0;
}

/** Reconstruct a 3x3 symmetric matrix from 6 flat components. */
function expandTensor(comps: number[]): number[][] {
  return [
    [comps[0], comps[3], comps[4]],
    [comps[3], comps[1], comps[5]],
    [comps[4], comps[5], comps[2]],
  ];
}

export default function StressStateCalculator() {
  const [components, setComponents] = useState<number[]>(() => [
    0, 0, 0, 0, 0, 0,
  ]);
  const [result, setResult] = useState<PrincipalStressOutput | null>(null);
  const [mode, setMode] = useState<DisplayMode>("original");
  const [rawValues, setRawValues] = useState<Record<string, string>>({});
  const componentsRef = useRef(components);
  if (components !== componentsRef.current) {
    componentsRef.current = components;
    if (Object.keys(rawValues).length > 0) {
      queueMicrotask(() => setRawValues({}));
    }
  }

  const handleTensorChange = useCallback(
    (row: number, col: number, value: string) => {
      const num = parseFloat(value) || 0;

      const idx = tensorIndex(row, col);
      setComponents((prev) => {
        const next = [...prev];
        next[idx] = num;
        return next;
      });
    },
    [],
  );

  const tensor = useMemo(() => expandTensor(components), [components]);

  const calculate = useCallback(async () => {
    try {
      const res = await calculatorService.getPrincipalStresses(components);
      toast.success("计算成功");
      setResult(res);
    } catch (e) {
      toast.error(`计算出错: ${e}`);
    }
  }, [components]);

  return (
    <div className="flex w-full h-screen">
      <main className="flex-1 relative h-screen">
        <SidebarTrigger className="absolute top-1 right-1 rotate-180 z-10" />
        <div className="flex flex-col md:flex-row h-full">
          <div className="flex-1 min-w-0">
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  加载中...
                </div>
              }
            >
              <StressCube3D
                tensor={tensor}
                principalStresses={result}
                mode={mode}
                className="w-full h-full"
              />
            </Suspense>
          </div>
          <div className="flex-1 min-w-0 min-h-36 md:border-l border-t md:border-t-0 border-border">
            {result ? (
              <Suspense>
                <MohrCircles
                  sigma1={result.sigma_1}
                  sigma2={result.sigma_2}
                  sigma3={result.sigma_3}
                  className="w-full h-full"
                />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                请先计算应力状态
              </div>
            )}
          </div>
        </div>
      </main>

      <StressStateSidebar
        mode={mode}
        result={result}
        onTensorChange={handleTensorChange}
        onModeChange={setMode}
        onCalculate={calculate}
      />
    </div>
  );
}
