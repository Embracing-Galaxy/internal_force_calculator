import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Beam } from "@/types/beam.ts";
import { BeamRenderer } from "./BeamRenderer.tsx";
import { SupportRenderer } from "./SupportRenderer.tsx";

interface BeamCanvasProps extends React.ComponentProps<"div"> {
  beam: Beam;
  error?: string | null;
}

export function BeamCanvas({
  beam,
  error,
  className,
  ...props
}: BeamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 计算绘图参数
    const beamPixelLength = Math.min(canvas.width - 100, 800);
    const pixelsPerMeter = beamPixelLength / beam.length;
    const offsetX = (canvas.width - beamPixelLength) / 2;

    // 计算垂直位置：三个部分均分画布（梁、剪力图、弯矩图）
    const beamY = canvas.height * 0.45;

    // 保存状态供子渲染器使用
    const renderContext = {
      ctx,
      beam,
      pixelsPerMeter,
      beamY,
      offsetX,
    };

    if (beam.length === 0) return;
    BeamRenderer(renderContext); // 绘制梁几何与荷载
    SupportRenderer(renderContext); // 绘制支座

    // 如果有错误，显示错误信息
    if (error) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "14px sans-serif";
      ctx.fillText(`错误: ${error}`, 50, 30);
    }
  }, [beam, error]);

  return (
    <div
      className={cn(
        "w-full h-full bg-white relative overflow-hidden",
        className,
      )}
      {...props}
    >
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="w-full h-full"
      />
    </div>
  );
}
