import { randInt, range, shuffle } from "../../core/common";
import { IAProcessGenerationFunction, IASelectionFunctionType } from "../ai/ga/gaProcesGenerationFunction";
import { GeneticAlgorithmNeuralNet } from "../ai/gann/gann";
import { IANNInitParams, NeuralNet } from "../ai/nn/nn";
import { IANNActivationFunction } from "../ai/nn/nnActivationFunctions";
import { Game } from "../game/game";
import { GameAiEval } from "./GameAiEval";


type DNA = NeuralNet;

export const GAME_INPUTS_AI = 3;

export type GameAIInitParams = {
  nnInit: {
    hiddenLayers: number[],
    afunction?: {
      hidden: IANNActivationFunction,
      output: IANNActivationFunction,
    },
  },
  gaInit: {
    popSize: number,
    proccessFunction: IAProcessGenerationFunction,
  },
  gameParams: {
  },
  aiParams: {
    /** sensor angles from center to both side (in radians) */
    sensors: number[]
  }
}

/**
 * class for training game bots
 */
export class GameAI {
  public gann: GeneticAlgorithmNeuralNet;


  public static readonly defaultInitParams: Readonly<GameAIInitParams> = {
    gaInit: {
      popSize: 100,
      proccessFunction: {
        breedingParents: 1,
        mutationRate: .01,
        selection: {
          type: IASelectionFunctionType.percent,
          value: .2,
        }
      }
    },
    nnInit: {
      hiddenLayers: [8, 8, 8],
    },
    gameParams: {
    },
    aiParams: {
      sensors: [Math.PI * 1 / 4, Math.PI * 1 / 8, Math.PI * 1 / 32],
    },
  }



  private createEnvironmentBatch() {
    return (dnas: DNA[]) => {
      const numOfGames = 4;
      const dnasWithRes: { dna: DNA, games: number, wins: number }[] =
        dnas.map(dna => ({ dna, games: 0, wins: 0 }));

      const queue = range(numOfGames)
        .map(x => [...dnasWithRes])
        .flat()
        ;

      shuffle(queue);

      while (queue.length) {
        const players = [
          queue.pop()!,
          queue.pop()
          // create fake player if second not present so it's dna score will not be affected
          ?? { dna: dnas[randInt(dnas.length)], games: 0, wins: 0 }
        ];
        players.forEach(p => { p.games++; });

        const evaler = new GameAiEval(players.map(x => x.dna));
        evaler.run();
        const winner = evaler.game.gameState.winner;
        players[winner].wins++;
      }

      return dnasWithRes.map(x => x.wins);
    };
  }

  /** calculate next generation */
  public next() {
  }

  constructor(ai: GameAIInitParams) {
    const sensorsNum = 1 + 2 * ai.aiParams.sensors.length;
    const _environmentBatch = this.createEnvironmentBatch();

    this.gann = GeneticAlgorithmNeuralNet.create({
      gaInit: ai.gaInit,
      nnInit: {
        layerScheme: {
          inputs: sensorsNum,
          hiddens: ai.nnInit.hiddenLayers,
          outputs: GAME_INPUTS_AI,
        }
      },
      _environment: { _environmentBatch },
    });
  }
}



