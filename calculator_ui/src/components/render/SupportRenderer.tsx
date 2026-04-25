import { type Beam, type SupportConfig, SupportType } from "@/types/beam";

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  beam: Beam;
  pixelsPerMeter: number;
  beamY: number;
  offsetX: number;
}

export function SupportRenderer(renderContext: RenderContext) {
  drawSupport(renderContext.beam.supportA, renderContext);
  drawSupport(renderContext.beam.supportB, renderContext);
}

function drawSupport(
  support: SupportConfig,
  { ctx, pixelsPerMeter, beamY, offsetX }: RenderContext,
) {
  const pos = support.position;
  const x = offsetX + pos * pixelsPerMeter;

  switch (support.type) {
    case SupportType.Hinge:
      drawHinge(ctx, x, beamY + 8);
      break;
    case SupportType.Roller:
      drawRoller(ctx, x, beamY + 8);
      break;
    case SupportType.Fixed:
      drawFixed(ctx, x, beamY - 9, pos === 0);
      break;
  }
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size, y + size * 1.5);
  ctx.lineTo(x + size, y + size * 1.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawHinge(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const size = 12;

  drawTriangle(ctx, x, y, size);

  // 地面线
  ctx.beginPath();
  ctx.moveTo(x - size - 5, y + size * 1.5);
  ctx.lineTo(x + size + 5, y + size * 1.5);
  ctx.stroke();

  // 斜线纹理
  for (let i = -size; i <= size; i += 4) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + size * 1.5);
    ctx.lineTo(x + i - 3, y + size * 1.5 + 5);
    ctx.stroke();
  }
}

function drawRoller(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const size = 12;

  drawTriangle(ctx, x, y, size);

  // 滚轮
  const wheelRadius = 5;
  const wheelCenterY = y + size * 1.5 + wheelRadius;
  const groundY = wheelCenterY + wheelRadius;

  ctx.beginPath();
  ctx.arc(x, wheelCenterY, wheelRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 地面线
  ctx.beginPath();
  ctx.moveTo(x - size - 5, groundY);
  ctx.lineTo(x + size + 5, groundY);
  ctx.stroke();

  // 斜线纹理
  for (let i = -size; i <= size; i += 4) {
    ctx.beginPath();
    ctx.moveTo(x + i, groundY);
    ctx.lineTo(x + i - 3, groundY + 5);
    ctx.stroke();
  }
}

function drawFixed(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isStart: boolean,
) {
  const height = 30;
  const width = 8;

  ctx.fillStyle = "#e2e8f0";
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;

  // 固定端填充
  const wallX = isStart ? x - width : x;
  ctx.fillRect(wallX, y - 5, width, height);
  ctx.strokeRect(wallX, y - 5, width, height);

  // 斜线纹理
  ctx.beginPath();
  for (let i = 0; i < height; i += 5) {
    ctx.moveTo(wallX, y - 5 + i);
    ctx.lineTo(wallX + width, y - 5 + i + 3);
  }
  ctx.stroke();
}
