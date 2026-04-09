import AppLayout from "@/components/AppLayout";
import BeamCalculator from "@/components/BeamCalculator";
import NormalStressCalculator from "@/components/NormalStressCalculator";
import { BrowserRouter, Route, Routes } from "react-router";

function App() {
  return (
    <BrowserRouter basename="/ifc">
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<BeamCalculator />} />
          <Route path="normal-stress" element={<NormalStressCalculator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
