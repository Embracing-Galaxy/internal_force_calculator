import { Input } from "@/components/ui/input";
import type { TensorChangeHandler } from "@/types/stress-state";

export default function TensorInput({
  onChange,
}: {
  onChange: TensorChangeHandler;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-lg font-serif italic w-9 shrink-0">σ =</span>
      <div className="flex flex-col gap-1">
        {/* Column headers: x y z */}
        <div className="flex gap-1">
          {["x", "y", "z"].map((label) => (
            <div key={label} className="w-14 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
          <div className="w-4 shrink-0" />
        </div>
        {/* Matrix rows */}
        {[0, 1, 2].map((rowIdx) => {
          return (
            <div key={rowIdx} className="flex gap-1 items-center">
              {[0, 1, 2].map((colIdx) => {
                return (
                  <Input
                    key={`cell-${rowIdx}-${colIdx}`}
                    disabled={colIdx < rowIdx}
                    className="w-14 h-8 text-center text-xs"
                    onChange={(e) => onChange(rowIdx, colIdx, e.target.value)}
                  />
                );
              })}
              <span className="w-4 shrink-0 text-xs font-medium text-muted-foreground text-center">
                {["x", "y", "z"][rowIdx]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
