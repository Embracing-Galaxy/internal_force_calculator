import InlineMath from "@matejmazur/react-katex";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrincipalStressOutput } from "@/services";

function fmt(n: number, decimals: number) {
  return parseFloat(n.toFixed(decimals)).toString();
}

function PrincipalRow({
  label,
  value,
  dir,
}: {
  label: string;
  value: number;
  dir: [number, number, number];
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <InlineMath math={label} />
        <Badge variant="outline" className="text-xs font-mono">
          {fmt(value, 4)}
        </Badge>
      </div>
      <div className="text-[10px] text-muted-foreground text-right">
        <InlineMath
          math={`\\mathbf{{n}} = (${fmt(dir[0], 3)}, ${fmt(dir[1], 3)}, ${fmt(dir[2], 3)})`}
        />
      </div>
    </div>
  );
}

interface StressResultDisplayProps {
  result: PrincipalStressOutput | null;
}

export default function StressResultDisplay({
  result,
}: StressResultDisplayProps) {
  if (!result) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">主应力</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <PrincipalRow
          label={"\\sigma_1"}
          value={result.sigma_1}
          dir={result.direction_1 as [number, number, number]}
        />
        <PrincipalRow
          label={"\\sigma_2"}
          value={result.sigma_2}
          dir={result.direction_2 as [number, number, number]}
        />
        <PrincipalRow
          label={"\\sigma_3"}
          value={result.sigma_3}
          dir={result.direction_3 as [number, number, number]}
        />
      </CardContent>
    </Card>
  );
}
