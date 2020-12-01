import { Render, Vector } from "matter-js";

const withRender = (render: Render, fnc: (ctx: CanvasRenderingContext2D) => void) => {
  const context = render.context;
  (Render as any).startViewTransform(render);
  fnc(context);
  (Render as any).endViewTransform(render);
};

export const renderLine = (render: Render, startPoint: Vector, endPoint: Vector) => {
  return withRender(render, (context) => {
    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(endPoint.x, endPoint.y);

    context.strokeStyle = "rgba(255,0,0,.7)";
    context.lineWidth = 1;
    context.stroke();

    context.fillStyle = "rgba(255,165,0,0.7)";
    context.fill();
  });
};

export const renderPoint = (render: Render, point: Vector, size = 5) => {
  return withRender(render, (context) => {
    context.beginPath();

    context.ellipse(point.x, point.y, size, size, 0, 0, Math.PI * 2);

    context.fillStyle = "rgba(0,0,255,0.7)";
    context.fill();
  });
};
