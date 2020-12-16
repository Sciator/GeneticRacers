import React, { useEffect, useRef, useState } from "react";
import { Button, Card } from "antd";
import { GameAiEval } from "../logic/gameAi/GameAiEval";
import { Render, Events } from "matter-js";
import { renderPoint, renderLine } from "../utils/rendererUtils";
import { Game } from "../logic/game/game";
import { NeuralNet } from "../_old/logic/ai/nn/nn";


const debug = false;

type TRunnerProps = {
  capture?: boolean,
  snapshot: NeuralNet[] | undefined,
};

const height = 300;
const width = 300;

export const PlayPage: React.FC<TRunnerProps> = ({ capture, snapshot }) => {
  const runningState = useState(false);
  const [evaler, setEvaler] = useState<GameAiEval | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(undefined as any);
  const [renderer, setRenderer] = useState<Render | undefined>(undefined);
  const setRunning = runningState[1];

  const canStart = !(runningState[0] || !snapshot);

  const start = () => {
    if (!canStart) return;
    setRunning(true);
    setEvaler(new GameAiEval(snapshot!, Game.SETTINGS_DEFAULT));
  }

  const stop = () => {
    setRunning(false);
  }

  useEffect(() => {
    if (runningState[0]) return;
    if (renderer)
      Render.stop(renderer)
    setRenderer(undefined);
    if (ref.current) ref.current.innerHTML = "";
  }, [renderer, runningState[0]])

  useEffect(() => {
    if (!ref.current || !evaler || !runningState[0]) return;
    // if (!ref.current) return;
    const element = ref.current;

    const game = evaler.game;
    // const game = new Game();
    const engine = game.engine;

    // create renderer
    const render = Render.create({
      element,
      engine,
      options: {
        width,
        height,

        background: "#cccccc",
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

    setRenderer(render);

    // Render.run(render);

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

    const targetDelta = game.settings.simulation.delta;

    let last = Date.now();
    const step = () => {
      const now = Date.now();
      const delta = now - last;
      if (delta < targetDelta) return;

      last += delta;
      // game.next();
      evaler.next();
      step();
    };

    const rafLoop = () => {
      step();
      if (!game.isGameOver) {
        // if ([runningState[0]])
        requestAnimationFrame(rafLoop);
      } else {

        // todo: print winner on canvas
        console.log(`winner is ${game.gameState.winner}`);
      }
    };
    requestAnimationFrame(rafLoop);

    Render.run(render);
  }, [evaler])

  const button = runningState[0]
    ? <Button onClick={stop}>Stop</Button>
    : <Button onClick={start} disabled={!canStart}>Play</Button>
    ;


  return <>
    <Card title="Play" extra={button}>
      <div style={{ justifyContent: "center", display: "flex" }}>
        <div ref={ref} />
      </div>
    </Card>
  </>;
};
