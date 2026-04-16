import { BrowserRouter, Route, Routes } from "react-router";
import AppLayout from "@/components/AppLayout";
import BeamCalculator from "@/components/BeamCalculator";
import NormalStressCalculator from "@/components/NormalStressCalculator";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
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
