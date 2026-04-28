import { Ruler } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SidebarMenuSubItem } from "@/components/ui/sidebar";
import CollapsibleSidebarMenu from "../CollapsibleSidebarMenu";

interface BeamPropertiesProps {
  onChange: (length: number) => void;
}

export default function BeamSettings({ onChange }: BeamPropertiesProps) {
  return (
    <CollapsibleSidebarMenu icon={Ruler} title="梁属性">
      <SidebarMenuSubItem>
        <div className="p-2 space-y-2">
          <Field>
            <FieldLabel
              htmlFor="beam-length"
              className="text-xs text-sidebar-foreground/70"
            >
              长度 (m)
            </FieldLabel>
            <Input
              id="beam-length"
              min={0}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === "") return;
                onChange(parseFloat(inputValue) || 0);
              }}
              className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </Field>
        </div>
      </SidebarMenuSubItem>
    </CollapsibleSidebarMenu>
  );
}
