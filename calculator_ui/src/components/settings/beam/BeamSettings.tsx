import { Ruler } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { SidebarMenuSubItem } from "@/components/ui/sidebar.tsx";
import { CollapsibleSidebarMenu } from "../CollapsibleSidebarMenu.tsx";

interface BeamPropertiesProps {
  onChange: (length: number) => void;
}

export function BeamSettings({ onChange }: BeamPropertiesProps) {
  return (
    <CollapsibleSidebarMenu icon={Ruler} title="梁属性">
      <SidebarMenuSubItem>
        <div className="p-2 space-y-2">
          <Label
            htmlFor="beam-length"
            className="text-xs text-sidebar-foreground/70"
          >
            长度 (m)
          </Label>
          <Input
            type="number"
            min={0}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (inputValue === "") return;
              onChange(parseFloat(inputValue) || 0);
            }}
            className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </SidebarMenuSubItem>
    </CollapsibleSidebarMenu>
  );
}
