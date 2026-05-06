import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router";
import AppLayout from "@/components/AppLayout";

const BeamCalculator = lazy(() => import("@/components/BeamCalculator"));
const NormalStressCalculator = lazy(
  () => import("@/components/NormalStressCalculator"),
);
const StressStateCalculator = lazy(
  () => import("@/components/StressStateCalculator"),
);

function App() {
  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center text-muted-foreground">
            加载中...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<BeamCalculator />} />
            <Route path="normal-stress" element={<NormalStressCalculator />} />
            <Route path="stress-state" element={<StressStateCalculator />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
