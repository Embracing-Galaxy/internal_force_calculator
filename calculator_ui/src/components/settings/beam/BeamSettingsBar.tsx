import { Button } from "@/components/ui/button.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar.tsx";
import { type Beam, type Load, SupportType } from "@/types/beam.ts";
import { BeamSettings } from "./BeamSettings.tsx";
import { LoadList } from "./LoadList.tsx";
import { SupportSettings } from "./SupportSettings.tsx";

interface SettingsBarProps {
  beam: Beam;
  onBeamChange: (beam: Beam) => void;
  onCalculate: () => void;
}

export default function BeamSettingsBar({
  beam,
  onBeamChange,
  onCalculate,
}: SettingsBarProps) {
  const handleLengthChange = (length: number) => {
    // 检查并更新固定端位置
    const updatedSupportA =
      beam.supportA.type === SupportType.Fixed && beam.supportA.position !== 0
        ? { ...beam.supportA, position: length }
        : beam.supportA;

    const updatedSupportB =
      beam.supportB.type === SupportType.Fixed && beam.supportB.position !== 0
        ? { ...beam.supportB, position: length }
        : beam.supportB;

    onBeamChange({
      ...beam,
      length,
      supportA: updatedSupportA,
      supportB: updatedSupportB,
    });
  };

  const handleSupportsChange = (beam: Beam) => {
    onBeamChange({ ...beam });
  };

  const handleLoadsChange = (loads: Load[]) => {
    onBeamChange({ ...beam, loads });
  };

  return (
    <Sidebar side="right" variant="floating">
      <SidebarContent>
        <BeamSettings onChange={handleLengthChange} />
        <SupportSettings beam={beam} onChange={handleSupportsChange} />
        <LoadList
          loads={beam.loads}
          beamLength={beam.length}
          onChange={handleLoadsChange}
        />
      </SidebarContent>

      <SidebarFooter>
        <Button className="w-full" onClick={onCalculate}>
          计算内力
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
