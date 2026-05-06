import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";

function isEditableCell(row: number, col: number): boolean {
  return col >= row;
}

function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

interface TensorInputProps {
  tensor: number[][];
  onChange: (row: number, col: number, value: string) => void;
}

export default function TensorInput({ tensor, onChange }: TensorInputProps) {
  // Local string state so users can type "-" first, then complete the number.
  // Cleared on blur — the parent's numeric state takes over.
  const [rawValues, setRawValues] = useState<Record<string, string>>({});
  const tensorRef = useRef(tensor);
  // Detect external tensor reset (e.g. programmatic clear) and flush stale raw state.
  if (tensor !== tensorRef.current) {
    tensorRef.current = tensor;
    if (Object.keys(rawValues).length > 0) {
      // Defer to avoid render-time setState warning.
      queueMicrotask(() => setRawValues({}));
    }
  }

  const getDisplayValue = (row: number, col: number): string => {
    const key = cellKey(row, col);
    if (key in rawValues) return rawValues[key];
    const val = tensor[row][col];
    if (val === 0 && !isEditableCell(row, col)) return "";
    return String(val);
  };

  const handleChange = (row: number, col: number, value: string) => {
    const key = cellKey(row, col);
    setRawValues((prev) => ({ ...prev, [key]: value }));
    onChange(row, col, value);
  };

  const handleBlur = (row: number, col: number) => {
    const key = cellKey(row, col);
    setRawValues((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

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
                const editable = isEditableCell(rowIdx, colIdx);
                return (
                  <Input
                    key={`cell-${rowIdx}-${colIdx}`}
                    value={getDisplayValue(rowIdx, colIdx)}
                    placeholder="0"
                    disabled={!editable}
                    className="w-14 h-8 text-center text-xs"
                    onChange={(e) =>
                      handleChange(rowIdx, colIdx, e.target.value)
                    }
                    onBlur={() => handleBlur(rowIdx, colIdx)}
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
