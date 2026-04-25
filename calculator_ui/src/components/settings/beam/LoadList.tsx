import { ArrowDownCircle, Plus, RotateCcw } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { SidebarMenuSubItem } from "@/components/ui/sidebar";
import { type Load, LoadType } from "@/types/beam";
import { CollapsibleSidebarMenu } from "../CollapsibleSidebarMenu";
import { LoadItem } from "./LoadItem";

interface LoadListProps {
  loads: Load[];
  beamLength: number;
  onChange: (loads: Load[]) => void;
}

export function LoadList({ loads, beamLength, onChange }: LoadListProps) {
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

  const removeLoad = (id: string) => {
    onChange(loads.filter((l) => l.id !== id));
  };

  const updateLoad = (id: string, updates: Partial<Load>) => {
    onChange(
      loads.map((l) => {
        if (l.id === id) {
          // 确保类型安全，只更新对应类型的属性
          if (l.type === LoadType.DistributedLoad) {
            const distributedUpdates = updates as Partial<typeof l>;
            return { ...l, ...distributedUpdates };
          } else {
            const pointOrMomentUpdates = updates as Partial<typeof l>;
            return { ...l, ...pointOrMomentUpdates };
          }
        }
        return l;
      }),
    );
  };

  return (
    <CollapsibleSidebarMenu icon={ArrowDownCircle} title="外荷载">
      <SidebarMenuSubItem>
        <div className="p-2 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addLoad(LoadType.PointLoad)}
          >
            <Plus className="w-3 h-3 mr-1" />
            集中力
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addLoad(LoadType.Moment)}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            力偶
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addLoad(LoadType.DistributedLoad)}
          >
            <Plus className="w-3 h-3 mr-1" />
            分布载荷
          </Button>
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
