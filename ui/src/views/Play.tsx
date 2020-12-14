import React, { useEffect, useRef } from "react";
import { Card } from "antd";
import { Events, Render, Vector } from "matter-js";
import { Game } from "../logic/game/game";
import { capturedKeys, keyCaptureStart, keyCaptureStop } from "../core/keycapture";
import { renderLine, renderPoint } from "../utils/rendererUtils";

type TRunnerProps = {
  capture?: boolean,
};

type TRendererProps = {
  width: number,
  height: number,
};

const Renderer: React.FC<TRendererProps> = ({ height, width }) => {
  const ref = useRef<HTMLDivElement>(undefined as any);
  const debug = false;

  const init = () => {
    (async () => {
      if (!ref.current)
        return;

      const game = new Game();

      const engine = game.engine;

      // create renderer
      const render = Render.create({
        element: ref.current,
        engine,
        options: {
          width,
          height,

          background: "#ffffff",
          wireframeBackground: "#0f0f13",
          wireframes: false,

          ...(debug
            ? {
              wireframes: true,
              showVelocity: true,
              showCollisions: true,
              showSeparations: true,
              showAngleIndicator: true,
            } : {}),
        } as any,
      });

      Render.run(render);

      // fit the render viewport to the scene
      (Render as any).lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: game.settings.map.size, y: game.settings.map.size },
      });

      Events.on(render, "afterRender", () => {
        game.gameState.players.forEach((_p, pi) => {
          const res = game.sensor(pi);
          const playerPos = game.gameState.players[pi].body.position;

          res.forEach(res => {
            renderPoint(render, res.point);
            renderLine(render, playerPos, res.point);
          });
        });
      });

      keyCaptureStart();

      let last = Date.now();
      const step = () => {
        const now = Date.now();
        const delta = now - last;
        last = now;

        const walk = capturedKeys.has("ArrowUp");
        const rotate = capturedKeys.has("ArrowLeft") ? -1
          : capturedKeys.has("ArrowRight") ? 1
            : 0
          ;
        const use = capturedKeys.has(" ");

        game.next({ players: [undefined, { walk, rotate, use } as any] }, delta);
      };

      const rafLoop = () => {
        step();
        if (!game.isGameOver) {
          requestAnimationFrame(rafLoop);
        } else {
          // todo: print winner on canvas
          console.log(`winner is ${game.gameState.winner}`);
        }
      };
      requestAnimationFrame(rafLoop);

    })();
  };
  useEffect(init, []);

  return <>
    <div style={{ justifyContent: "center", display: "flex" }}>
      <div ref={ref} />
    </div>
  </>;
};

export const PlayPage: React.FC<TRunnerProps> = ({ capture }) => {
  if (capture)
    keyCaptureStart();
  else
    keyCaptureStop();

  return <>
    <Card title="Play">
      <Renderer {...{ width: 500, height: 500 }} />
    </Card>
  </>;
};
