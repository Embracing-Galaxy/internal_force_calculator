import { type Beam, LoadType } from "@/types/beam.ts";

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  beam: Beam;
  pixelsPerMeter: number;
  beamY: number;
  offsetX: number;
}

export function BeamRenderer({
  ctx,
  beam,
  pixelsPerMeter,
  beamY,
  offsetX,
}: RenderContext) {
  const startX = offsetX;
  const endX = offsetX + beam.length * pixelsPerMeter;

  // 绘制梁轴线
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startX, beamY);
  ctx.lineTo(endX, beamY);
  ctx.stroke();

  // 绘制梁轮廓（矩形截面示意）
  ctx.fillStyle = "#f1f5f9";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1;
  const beamHeight = 24; // 增加梁的高度
  ctx.fillRect(startX, beamY - beamHeight / 2, endX - startX, beamHeight);
  ctx.strokeRect(startX, beamY - beamHeight / 2, endX - startX, beamHeight);

  // 长度标注线
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  const dimY = beamY - 40;
  ctx.beginPath();
  ctx.moveTo(startX, dimY);
  ctx.lineTo(endX, dimY);
  ctx.stroke();

  // 箭头
  drawArrow(ctx, startX, dimY, startX + 5, dimY);
  drawArrow(ctx, endX, dimY, endX - 5, dimY);

  // 标注文字
  ctx.fillText(`${beam.length.toFixed(1)}m`, (startX + endX) / 2, dimY - 20);

  // 绘制荷载
  beam.loads.forEach((load) => {
    if (load.type === LoadType.PointLoad) {
      const x = offsetX + load.position * pixelsPerMeter;
      drawPointLoad(ctx, x, beamY, load.magnitude);
    } else if (load.type === LoadType.Moment) {
      const x = offsetX + load.position * pixelsPerMeter;
      drawMomentLoad(ctx, x, beamY, load.magnitude);
    } else if (load.type === LoadType.DistributedLoad) {
      const startX = offsetX + load.startPosition * pixelsPerMeter;
      const endX = offsetX + load.endPosition * pixelsPerMeter;
      drawDistributedLoad(ctx, startX, endX, beamY, load.magnitude);
    }
  });
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) {
  const headlen = 5;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6),
  );
  ctx.fill();
}

function drawPointLoad(
  ctx: CanvasRenderingContext2D,
  x: number,
  beamY: number,
  magnitude: number,
) {
  const isUp = magnitude > 0;
  const arrowLength = 40;
  const endY = isUp ? beamY - arrowLength : beamY + arrowLength;
  const beamHeight = 24;

  ctx.strokeStyle = magnitude > 0 ? "#22c55e" : "#ef4444";
  ctx.fillStyle = magnitude > 0 ? "#22c55e" : "#ef4444";
  ctx.lineWidth = 2;

  // 箭头
  ctx.beginPath();
  ctx.moveTo(x, beamY - beamHeight / 2);
  ctx.lineTo(x, endY);
  ctx.stroke();

  // 箭头头部
  drawArrow(ctx, x, endY + (isUp ? 5 : -5), x, endY);

  // 数值标注
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    `${Math.abs(magnitude).toFixed(1)}kN`,
    x + 5,
    endY + (isUp ? -5 : 15),
  );
}

function drawMomentLoad(
  ctx: CanvasRenderingContext2D,
  x: number,
  beamY: number,
  magnitude: number,
) {
  const radius = 20;
  const isCCW = magnitude > 0;

  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 2;

  // 绘制弧线
  ctx.beginPath();
  ctx.arc(x, beamY, radius, 0, Math.PI * 1.5, !isCCW);
  ctx.stroke();

  // 箭头头部
  const angle = isCCW ? Math.PI * 1.5 : 0;
  const arrowX = x + radius * Math.cos(angle);
  const arrowY = beamY + radius * Math.sin(angle);

  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY);
  ctx.lineTo(arrowX - 5, arrowY - 5);
  ctx.lineTo(arrowX + 5, arrowY - 5);
  ctx.fill();

  // 标注
  ctx.fillStyle = "#f97316";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.abs(magnitude).toFixed(1)}kN·m`, x, beamY - radius - 8);
}

function drawDistributedLoad(
  ctx: CanvasRenderingContext2D,
  startX: number,
  endX: number,
  beamY: number,
  magnitude: number,
) {
  const isUp = magnitude > 0;
  const arrowLength = 30;
  const arrowY = isUp ? beamY - arrowLength : beamY + arrowLength;

  ctx.strokeStyle = magnitude > 0 ? "#22c55e" : "#ef4444";
  ctx.fillStyle = magnitude > 0 ? "#22c55e" : "#ef4444";
  ctx.lineWidth = 2;

  // 绘制分布载荷线
  ctx.beginPath();
  ctx.moveTo(startX, arrowY);
  ctx.lineTo(endX, arrowY);
  ctx.stroke();

  // 绘制箭头
  const arrowSpacing = 30;
  const numArrows = Math.floor((endX - startX) / arrowSpacing) + 1;
  for (let i = 0; i < numArrows; i++) {
    const x = startX + ((endX - startX) * i) / (numArrows - 1);
    ctx.beginPath();
    ctx.moveTo(x, arrowY);
    ctx.lineTo(x, isUp ? arrowY + 5 : arrowY - 5);
    ctx.stroke();
    drawArrow(ctx, x, isUp ? arrowY + 5 : arrowY - 5, x, arrowY);
  }

  // 标注
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${Math.abs(magnitude).toFixed(1)}kN/m`,
    (startX + endX) / 2,
    arrowY + (isUp ? -10 : 20),
  );
}
