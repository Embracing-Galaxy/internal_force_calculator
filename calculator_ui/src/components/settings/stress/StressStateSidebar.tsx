import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import type { PrincipalStressOutput } from "@/services";
import StressResultDisplay from "./StressResultDisplay";
import TensorInput from "./TensorInput";

type DisplayMode = "original" | "principal";

interface StressStateSidebarProps {
  tensor: number[][];
  mode: DisplayMode;
  result: PrincipalStressOutput | null;
  isCalculating: boolean;
  onTensorChange: (row: number, col: number, value: string) => void;
  onModeChange: (mode: DisplayMode) => void;
  onCalculate: () => void;
}

export default function StressStateSidebar({
  tensor,
  mode,
  result,
  isCalculating,
  onTensorChange,
  onModeChange,
  onCalculate,
}: StressStateSidebarProps) {
  return (
    <div className="[--sidebar-width:20rem]">
      <Sidebar side="right" variant="floating">
        <SidebarContent className="gap-4 p-4">
          {/* Tensor Input */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">应力张量</CardTitle>
            </CardHeader>
            <CardContent>
              <TensorInput tensor={tensor} onChange={onTensorChange} />
            </CardContent>
          </Card>

          {/* Display Mode Toggle */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">显示模式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={mode === "original" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => onModeChange("original")}
                >
                  原始坐标系
                </Button>
                <Button
                  variant={mode === "principal" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => onModeChange("principal")}
                  disabled={!result}
                >
                  主应力方向
                </Button>
              </div>
            </CardContent>
          </Card>

          <StressResultDisplay result={result} />
        </SidebarContent>

        <SidebarFooter>
          <Button
            onClick={onCalculate}
            disabled={isCalculating}
            className="w-full"
          >
            {isCalculating ? "计算中..." : "计算主应力"}
          </Button>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
