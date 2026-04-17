import { AlertCircle, Anchor } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarMenuSubItem } from "@/components/ui/sidebar";
import { type Beam, SupportType } from "@/types/beam";
import { CollapsibleSidebarMenu } from "../CollapsibleSidebarMenu";

interface SupportConfigProps {
  label: string;
  support: Beam["supportA"] | Beam["supportB"];
  onUpdate: (updates: Partial<Beam["supportA"] | Beam["supportB"]>) => void;
  beamLength: number;
  colorClass: string;
}

function SupportConfig({
  label,
  support,
  onUpdate,
  beamLength,
  colorClass,
}: SupportConfigProps) {
  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // 允许输入框为空
    if (inputValue === "") {
      return;
    }
    const value = parseFloat(inputValue) || 0;
    // 固定端只能在梁的两端
    if (support.type === SupportType.Fixed) {
      const clampedValue = value < beamLength / 2 ? 0 : beamLength;
      onUpdate({ position: clampedValue });
    } else {
      onUpdate({ position: value });
    }
  };

  const handleTypeChange = (type: SupportType) => {
    // 切换到固定端时，自动设置到最近的端点
    if (type === SupportType.Fixed) {
      const position = support.position < beamLength / 2 ? 0 : beamLength;
      onUpdate({ type, position });
    } else {
      onUpdate({ type });
    }
  };

  const positionDisabled = support.type === SupportType.Fixed;

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${colorClass}`}>{label}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-sidebar-foreground/70">
            位置 (m)
          </Label>
          <Input
            type="number"
            max={beamLength}
            onChange={handlePositionChange}
            disabled={positionDisabled}
            className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-sidebar-foreground/70">类型</Label>
          <Select value={support.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SupportType.None}>无约束</SelectItem>
              <SelectItem value={SupportType.Hinge}>铰支座</SelectItem>
              <SelectItem value={SupportType.Roller}>可动铰支座</SelectItem>
              <SelectItem value={SupportType.Fixed}>固定端</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function SupportSettings({
  beam,
  onChange,
}: {
  beam: Beam;
  onChange: (beam: Beam) => void;
}) {
  const validation = useMemo(() => {
    if (beam.length === 0) return { error: null };
    if (beam.supportA.position === beam.supportB.position) {
      return { error: "支座A和B位置不能重叠" };
    }
    if (
      beam.supportA.position > beam.length ||
      beam.supportB.position > beam.length
    ) {
      return { error: "位置超出梁长度" };
    }
    return { error: null };
  }, [beam]);

  const updateSupportA = (updates: Partial<Beam["supportA"]>) => {
    onChange({
      ...beam,
      supportA: { ...beam.supportA, ...updates },
    });
  };

  const updateSupportB = (updates: Partial<Beam["supportB"]>) => {
    onChange({
      ...beam,
      supportB: { ...beam.supportB, ...updates },
    });
  };

  return (
    <CollapsibleSidebarMenu icon={Anchor} title="支座配置">
      <SidebarMenuSubItem>
        <SupportConfig
          label="支座 A"
          colorClass="text-blue-500"
          support={beam.supportA}
          onUpdate={updateSupportA}
          beamLength={beam.length}
        />
      </SidebarMenuSubItem>
      <SidebarMenuSubItem>
        <SupportConfig
          label="支座 B"
          colorClass="text-orange-600"
          support={beam.supportB}
          onUpdate={updateSupportB}
          beamLength={beam.length}
        />
      </SidebarMenuSubItem>
      <SidebarMenuSubItem>
        {validation.error && (
          <div className="flex items-center gap-2 text-[11px] text-red-500 bg-red-50 p-2 rounded">
            <AlertCircle className="w-3 h-3" />
            {validation.error}
          </div>
        )}
      </SidebarMenuSubItem>
    </CollapsibleSidebarMenu>
  );
}
