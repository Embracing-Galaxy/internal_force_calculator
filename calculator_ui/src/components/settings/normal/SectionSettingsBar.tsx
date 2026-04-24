import { MousePointer2, SquircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { CollapsibleSidebarMenu } from "../CollapsibleSidebarMenu";

interface SectionSettingsBarProps {
  onChangeFormula: (formula: string) => void;
  onChangeForceX: (x: number) => void;
  onChangeForceY: (y: number) => void;
  onChangeForceZ: (z: number) => void;
  onChangeForcePointY: (y: number) => void;
  onChangeForcePointZ: (z: number) => void;
  onCalculate: () => void;
}

export default function SectionSettingsBar({
  onChangeFormula,
  onChangeForceX,
  onChangeForceY,
  onChangeForceZ,
  onChangeForcePointY,
  onChangeForcePointZ,
  onCalculate,
}: SectionSettingsBarProps) {
  return (
    <Sidebar side="right" variant="floating">
      <SidebarContent>
        <CollapsibleSidebarMenu icon={SquircleDashed} title="截面方程">
          <SidebarMenuSubItem className="flex">
            <Input onChange={(e) => onChangeFormula(e.target.value)} />
            <Label>&lt;=0</Label>
          </SidebarMenuSubItem>
        </CollapsibleSidebarMenu>
        <CollapsibleSidebarMenu icon={MousePointer2} title="外力向量">
          <SidebarMenuSubItem className="flex">
            <Label>x:</Label>
            <Input onChange={(e) => onChangeForceX(Number(e.target.value))} />
            <Label>y:</Label>
            <Input onChange={(e) => onChangeForceY(Number(e.target.value))} />
            <Label>z:</Label>
            <Input onChange={(e) => onChangeForceZ(Number(e.target.value))} />
          </SidebarMenuSubItem>
        </CollapsibleSidebarMenu>
        <CollapsibleSidebarMenu icon={MousePointer2} title="外力作用点">
          <SidebarMenuSubItem className="flex">
            <Label>y:</Label>
            <Input
              onChange={(e) => onChangeForcePointY(Number(e.target.value))}
            />
            <Label>z:</Label>
            <Input
              onChange={(e) => onChangeForcePointZ(Number(e.target.value))}
            />
          </SidebarMenuSubItem>
        </CollapsibleSidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button className="w-full" onClick={onCalculate}>
          计算正应力
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
