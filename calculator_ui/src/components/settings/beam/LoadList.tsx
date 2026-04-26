import { ArrowDownCircle, Plus, RotateCcw } from "lucide-react";
import { nanoid } from "nanoid";
import type React from "react";
import { Button } from "@/components/ui/button";
import { SidebarMenuSubItem } from "@/components/ui/sidebar";
import { type Load, LoadType } from "@/types/beam";
import CollapsibleSidebarMenu from "../CollapsibleSidebarMenu";
import LoadItem from "./LoadItem";

interface LoadListProps {
  loads: Load[];
  beamLength: number;
  onChange: (loads: Load[]) => void;
}

export default function LoadList({
  loads,
  beamLength,
  onChange,
}: LoadListProps) {
  const addLoad = (type: LoadType) => {
    if (type === LoadType.DistributedLoad) {
      const newLoad: Load = {
        id: nanoid(),
        type: LoadType.DistributedLoad,
        startPosition: 0,
        endPosition: beamLength,
        magnitude: -5,
      };
      onChange([...loads, newLoad]);
    } else {
      const newLoad: Load = {
        id: nanoid(),
        position: beamLength / 2,
        magnitude: -10,
        type,
      };

      onChange([...loads, newLoad]);
    }
  };

  const removeLoad = (index: number) => {
    onChange(loads.filter((_, i) => i !== index));
  };

  const updateLoad = (index: number, updates: Partial<Load>) => {
    onChange(
      loads.map((_load, i) => {
        if (i === index) {
          // 确保类型安全，只更新对应类型的属性
          if (_load.type === LoadType.DistributedLoad) {
            const distributedUpdates = updates as Partial<typeof _load>;
            return { ..._load, ...distributedUpdates };
          } else {
            const pointOrMomentUpdates = updates as Partial<typeof _load>;
            return { ..._load, ...pointOrMomentUpdates };
          }
        }
        return _load;
      }),
    );
  };

  const LoadButton = ({
    icon: Icon,
    label,
    type,
  }: {
    icon: React.ElementType;
    label: string;
    type: LoadType;
  }) => (
    <Button variant="outline" size="sm" onClick={() => addLoad(type)}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Button>
  );

  return (
    <CollapsibleSidebarMenu icon={ArrowDownCircle} title="外荷载">
      <SidebarMenuSubItem>
        <div className="p-2 flex flex-col gap-2">
          <LoadButton icon={Plus} label="集中力" type={LoadType.PointLoad} />
          <LoadButton icon={RotateCcw} label="力偶" type={LoadType.Moment} />
          <LoadButton
            icon={Plus}
            label="分布载荷"
            type={LoadType.DistributedLoad}
          />
        </div>
      </SidebarMenuSubItem>

      {loads.map((load, index) => (
        <LoadItem
          key={load.id}
          load={load}
          index={index}
          beamLength={beamLength}
          onUpdate={updateLoad}
          onRemove={removeLoad}
        />
      ))}

      {loads.length === 0 && (
        <SidebarMenuSubItem>
          <p className="text-xs text-sidebar-foreground/50 italic text-center py-4">
            添加上方荷载类型
          </p>
        </SidebarMenuSubItem>
      )}
    </CollapsibleSidebarMenu>
  );
}
