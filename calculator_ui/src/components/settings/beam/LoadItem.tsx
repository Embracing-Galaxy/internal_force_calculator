import { ArrowDownCircle, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SidebarMenuSubItem } from "@/components/ui/sidebar";
import { type Load, LoadType } from "@/types/beam";

interface LoadItemProps {
  load: Load;
  index: number;
  beamLength: number;
  onUpdate: (index: number, updates: Partial<Load>) => void;
  onRemove: (index: number) => void;
}

export default function LoadItem({
  load,
  index,
  beamLength,
  onUpdate,
  onRemove,
}: LoadItemProps) {
  return (
    <SidebarMenuSubItem>
      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {load.type === LoadType.PointLoad ? (
              <ArrowDownCircle className="w-3 h-3 text-blue-500" />
            ) : load.type === LoadType.Moment ? (
              <RotateCcw className="w-3 h-3 text-orange-500" />
            ) : (
              <ArrowDownCircle className="w-3 h-3 text-green-500" />
            )}
            <span className="text-xs font-medium text-sidebar-foreground/70">
              {load.type === LoadType.PointLoad
                ? "集中力"
                : load.type === LoadType.Moment
                  ? "力偶"
                  : "分布载荷"}{" "}
              {index + 1}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {load.type === LoadType.DistributedLoad ? (
          <div className="space-y-2">
            <FieldGroup className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel
                  htmlFor="start-position"
                  className="text-[10px] text-sidebar-foreground/70"
                >
                  起始位置 (m)
                </FieldLabel>
                <Input
                  id="start-position"
                  min={0}
                  max={beamLength}
                  value={load.startPosition}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === "") {
                      return;
                    }
                    onUpdate(index, {
                      startPosition: parseFloat(inputValue) || 0,
                    });
                  }}
                  className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </Field>
              <Field>
                <FieldLabel
                  htmlFor="end-position"
                  className="text-[10px] text-sidebar-foreground/70"
                >
                  结束位置 (m)
                </FieldLabel>
                <Input
                  id="end-position"
                  min={0}
                  max={beamLength}
                  value={load.endPosition}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === "") {
                      return;
                    }
                    onUpdate(index, {
                      endPosition: parseFloat(inputValue) || 0,
                    });
                  }}
                  className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </Field>
            </FieldGroup>
            <Field>
              <FieldLabel
                htmlFor="magnitude"
                className="text-[10px] text-sidebar-foreground/70"
              >
                大小 (kN/m)
              </FieldLabel>
              <FieldContent>
                <Input
                  value={load.magnitude}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === "") {
                      return;
                    }
                    onUpdate(index, {
                      magnitude: parseFloat(inputValue) || 0,
                    });
                  }}
                  className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </FieldContent>
            </Field>
          </div>
        ) : (
          <FieldGroup className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel
                htmlFor="pos"
                className="text-[10px] text-sidebar-foreground/70"
              >
                位置 (m)
              </FieldLabel>
              <Input
                id="pos"
                min={0}
                max={beamLength}
                value={load.position}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === "") {
                    return;
                  }
                  onUpdate(index, {
                    position: parseFloat(inputValue) || 0,
                  });
                }}
                className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="magnitude"
                className="text-[10px] text-sidebar-foreground/70"
              >
                大小 ({load.type === LoadType.PointLoad ? "kN" : "kN·m"})
              </FieldLabel>
              <Input
                id="magnitude"
                value={load.magnitude}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === "") {
                    return;
                  }
                  onUpdate(index, {
                    magnitude: parseFloat(inputValue) || 0,
                  });
                }}
                className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </Field>
          </FieldGroup>
        )}
      </div>
    </SidebarMenuSubItem>
  );
}
