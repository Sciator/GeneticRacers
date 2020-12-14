import React, { useEffect, useRef } from "react";
import { Card } from "antd";
import { Game } from "../logic/game/game";
import { capturedKeys, keyCaptureStart, keyCaptureStop } from "../core/keycapture";
import { gameRender } from "../logic/game/render";
import { GameAiEval } from "../logic/gameAi/GameAiEval";
import { range } from "../core/common";
import { GameAI } from "../logic/gameAi/GameAi";

const debug = false;

type TRunnerProps = {
  capture?: boolean,
};

type TRendererProps = {
  width: number,
  height: number,
};

const Renderer: React.FC<TRendererProps> = ({ height, width }) => {
  const ref = useRef<HTMLDivElement>(undefined as any);

  const init = () => {
    setTimeout(() => {
      _init();
    }, (2000));
  }

  const _init = () => {
    if (!ref.current)
      return;
    // const game = new Game();
    const element = ref.current;

    const botsNNs = range(2).map(() => GameAiEval.initializeRandomBot(
      { hiddens: [8, 5, 3], sensorSidesArrayAngleLength: GameAI.defaultInitParams.aiParams.sensors.length }
    ))
    const gameAi = new GameAiEval(botsNNs);

    const aiInput = () => gameAi.calculateBotResponse();

    const userInput = () => {
      const walk = capturedKeys.has("ArrowUp");
      const rotate = capturedKeys.has("ArrowLeft") ? -1
        : capturedKeys.has("ArrowRight") ? 1
          : 0
        ;
      const use = capturedKeys.has(" ");
      return { players: [undefined, { walk, rotate, use } as any] };
    };

    keyCaptureStart();

    gameRender({
      element, game: gameAi.game, height, width, debug, input: aiInput,
    });
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
