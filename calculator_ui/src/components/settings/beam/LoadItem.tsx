import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { SidebarMenuSubItem } from '@/components/ui/sidebar.tsx';
import { Load, LoadType } from '@/types/beam.ts';
import { ArrowDownCircle, RotateCcw, Trash2 } from 'lucide-react';

interface LoadItemProps {
    load: Load;
    index: number;
    beamLength: number;
    onUpdate: (id: string, updates: Partial<Load>) => void;
    onRemove: (id: string) => void;
}

export function LoadItem({ load, index, beamLength, onUpdate, onRemove }: LoadItemProps) {
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
                            {load.type === LoadType.PointLoad ? '集中力' : 
                             load.type === LoadType.Moment ? '力偶' : '分布载荷'} {index + 1}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(load.id)}
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>

                {load.type === LoadType.DistributedLoad ? (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-[10px] text-sidebar-foreground/70">起始位置 (m)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={beamLength}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        if (inputValue === '') {
                                            return;
                                        }
                                        onUpdate(load.id, {
                                            startPosition: parseFloat(inputValue) || 0,
                                        });
                                    }}
                                    className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-sidebar-foreground/70">结束位置 (m)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={beamLength}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        if (inputValue === '') {
                                            return;
                                        }
                                        onUpdate(load.id, {
                                            endPosition: parseFloat(inputValue) || 0,
                                        });
                                    }}
                                    className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-sidebar-foreground/70">
                                大小 (kN/m)
                            </Label>
                            <Input
                                type="number"
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (inputValue === '') {
                                        return;
                                    }
                                    onUpdate(load.id, {
                                        magnitude: parseFloat(inputValue) || 0,
                                    });
                                }}
                                className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-sidebar-foreground/70">位置 (m)</Label>
                            <Input
                                type="number"
                                min={0}
                                max={beamLength}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (inputValue === '') {
                                        return;
                                    }
                                    onUpdate(load.id, {
                                        position: parseFloat(inputValue) || 0,
                                    });
                                }}
                                className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-[10px] text-sidebar-foreground/70">
                                大小 ({load.type === LoadType.PointLoad ? 'kN' : 'kN·m'})
                            </Label>
                            <Input
                                type="number"
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (inputValue === '') {
                                        return;
                                    }
                                    onUpdate(load.id, {
                                        magnitude: parseFloat(inputValue) || 0,
                                    });
                                }}
                                className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>
                    </div>
                )}
            </div>
        </SidebarMenuSubItem>
    );
}