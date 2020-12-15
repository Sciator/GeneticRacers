import React, { useEffect, useRef } from "react";
import { Card } from "antd";
import { Game } from "../logic/game/game";
import { keyCaptureStart, keyCaptureStop } from "../core/keycapture";
import { gameRender } from "../logic/game/render";
import { GameAiEval } from "../logic/gameAi/GameAiEval";
import { range } from "../core/common";
import { GameAI } from "../logic/gameAi/GameAi";
import { IASelectionFunctionType } from "../logic/ai/ga/gaProcesGenerationFunction";

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

  const _init = async () => {
    if (!ref.current)
      return;
    // const game = new Game();
    const element = ref.current;

    const gameAi = new GameAI({
      aiParams: {
        sensors: Game.SETTINGS_DEFAULT.ai.sensorSidesArrayAngle,
      },
      gaInit: {
        popSize: 5,
        proccessFunction: {
          breedingParents: 1,
          mutationRate: .01,
          selection: {
            type: IASelectionFunctionType.percent,
            value: 5,
          }
        }
      },
      games: 4,
      gameSettings: Game.SETTINGS_DEFAULT,
      nnInit: { hiddenLayers: [20, 10], },
    }, () => {
      console.log("game ended");
    });

    range(0).forEach(x => {
      console.log(`generation ${x} best: ${gameAi.gann.ga.population[0].fitness}`);
      gameAi.next(() => {
        console.log("game ended");
      });
    })

    // const botsNNs = range(2).map(() => GameAiEval.initializeRandomBot(
    //   { hiddens: [8, 5, 3], sensors: GameAI.defaultInitParams.aiParams.sensors }
    // ))

    const pop = gameAi.gann.ga.population;
    const botsNNs = [pop[0].dna, pop[1].dna];

    const gameAiEval = new GameAiEval(botsNNs, Game.SETTINGS_DEFAULT);

    const aiInput = () => gameAiEval.calculateBotResponse();

    // keyCaptureStart();
    // const userInput = () => {
    //   const walk = capturedKeys.has("ArrowUp");
    //   const rotate = capturedKeys.has("ArrowLeft") ? -1
    //     : capturedKeys.has("ArrowRight") ? 1
    //       : 0
    //     ;
    //   const use = capturedKeys.has(" ");
    //   return { players: [{ walk, rotate, use } as any] };
    // };

    gameRender({
      element, game: gameAiEval.game, height, width, debug, input: aiInput,
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
