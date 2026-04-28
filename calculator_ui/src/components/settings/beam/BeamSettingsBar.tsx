import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { type Beam, type Load, SupportType } from "@/types/beam";
import BeamSettings from "./BeamSettings";
import LoadList from "./LoadList";
import SupportSettings from "./SupportSettings";

const normalizePosition = (position: number, length: number): number => {
  return position < 0 ? length + position : position;
};

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
    const normalizedBeam = {
      ...beam,
      supportA: {
        ...beam.supportA,
        position: normalizePosition(beam.supportA.position, beam.length),
      },
      supportB: {
        ...beam.supportB,
        position: normalizePosition(beam.supportB.position, beam.length),
      },
    };
    onBeamChange(normalizedBeam);
  };

  const handleLoadsChange = (loads: Load[]) => {
    const normalizedLoads = loads.map((load) => {
      switch (load.type) {
        case "point":
        case "moment":
          return {
            ...load,
            position: normalizePosition(load.position, beam.length),
          };
        case "distributed":
          return {
            ...load,
            startPosition: normalizePosition(load.startPosition, beam.length),
            endPosition: normalizePosition(load.endPosition, beam.length),
          };
        default:
          return load;
      }
    });
    onBeamChange({ ...beam, loads: normalizedLoads });
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
