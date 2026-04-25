import { HashRouter, Route, Routes } from "react-router";
import AppLayout from "@/components/AppLayout";
import BeamCalculator from "@/components/BeamCalculator";
import NormalStressCalculator from "@/components/NormalStressCalculator";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<BeamCalculator />} />
          <Route path="normal-stress" element={<NormalStressCalculator />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
