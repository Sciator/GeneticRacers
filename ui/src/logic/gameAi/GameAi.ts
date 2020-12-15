import { randInt, range, shuffle } from "../../core/common";
import { IAProcessGenerationFunction, IASelectionFunctionType } from "../ai/ga/gaProcesGenerationFunction";
import { GeneticAlgorithmNeuralNet } from "../ai/gann/gann";
import { NeuralNet } from "../ai/nn/nn";
import { IANNActivationFunction } from "../ai/nn/nnActivationFunctions";
import { Game, GameSettings } from "../game/game";
import { GameAiEval } from "./GameAiEval";


type DNA = NeuralNet;

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
  games: number,
  gameSettings: GameSettings,
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
  public proccessFunction: IAProcessGenerationFunction;
  public games: number;
  public gameSettings: GameSettings;

  public static readonly defaultInitParams: Partial<GameAIInitParams> = {
    gaInit: {
      popSize: 100,
      proccessFunction: {
        breedingParents: 1,
        mutationRate: .01,
        selection: {
          type: IASelectionFunctionType.percent,
          value: 10,
        }
      }
    },
    nnInit: {
      hiddenLayers: [8, 8, 8],
    },
    games: 10,
    aiParams: {
      sensors: [Math.PI * 1 / 4, Math.PI * 1 / 8, Math.PI * 1 / 32],
    },
  }

  private onGameEnd: (() => void) | undefined = undefined;


  private createEnvironmentBatch() {
    return (dnas: DNA[]) => {
      const numOfGames = this.games;
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

        const evaler = new GameAiEval(players.map(x => x.dna), this.gameSettings);
        evaler.run();
        const winner = evaler.game.gameState.winner;
        if (winner >= 0) {
          players.forEach(x => x.wins--)
          players[winner].wins += 20;
        } else {
          players.forEach(x => x.wins -= 0.5);
        }
        this?.onGameEnd?.();
      }

      return dnasWithRes.map(x => x.wins);
    };
  }

  /** calculate next generation */
  public next(onGameEnd?: () => void) {
    this.onGameEnd = onGameEnd;
    this.gann = this.gann.calculateNextGen(this.proccessFunction);
    this.onGameEnd = undefined;
  }

  constructor(ai: GameAIInitParams, onGameEnd?: () => void) {
    const sensors = ai.aiParams.sensors;
    const inputs = GameAiEval.NN_INPUTS_GET({ sensors });
    const outputs = GameAiEval.NN_OUTPUTS;
    const _environmentBatch = this.createEnvironmentBatch();

    this.proccessFunction = ai.gaInit.proccessFunction;
    this.games = ai.games;
    this.gameSettings = ai.gameSettings;

    this.onGameEnd = onGameEnd;
    this.gann = GeneticAlgorithmNeuralNet.create({
      gaInit: ai.gaInit,
      nnInit: {
        layerScheme: {
          inputs,
          hiddens: ai.nnInit.hiddenLayers,
          outputs,
        }
      },
      _environment: { _environmentBatch },
    });
    this.onGameEnd = undefined;
  }
}



