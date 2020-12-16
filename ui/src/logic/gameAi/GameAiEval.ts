import { Vector } from "matter-js";
import { IANNInitParams, NeuralNet } from "../ai/nn/nn";
import { EGameStateObjectType, Game, GameInputPlayer, GameSettings, SensorPoint } from "../game/game";


export type InitializeRandomBotParams = {
  /** length of gameAI's sensorSidesArrayAngle */
  sensors: number[] | { length: number },
  /** hiden layers number of neurons */
  hiddens: number[],
  /** activation functions */
  afunction?: IANNInitParams["afunction"]
};

/**
 * represents sensor resulted type as number
 */
const numFromType = (type: EGameStateObjectType | "none" | "unknown") => {
  switch (type) {
    case "none":
      return 1;
    case EGameStateObjectType.wall:
      return 2;
    case EGameStateObjectType.player:
      return 3;
    case EGameStateObjectType.bullet:
      return 4;

    case "unknown":
      return 4;

    default:
      console.warn("unknown type of sensor");
      return -1;
  }
}

/** distance of two vecotrs */
const dist = (vec1: Vector, vec2: Vector) => Vector.magnitude(Vector.add(vec1, Vector.neg(vec2)))

/**
 * class for evaling game with bots
 */
export class GameAiEval {
  public game: Game;
  public playerNNs: NeuralNet[];

  public get done() {
    return this.game.isGameOver;
  }

  /** number of nn outputs that is needed to convert into game input */
  public static NN_OUTPUTS = 4;
  /** returns number of nn inputs for given sensors array */
  public static NN_INPUTS_GET({ sensors }: { sensors: number[] | { length: number } }) {
    return (sensors.length * 2 + 1) * 2;
  }

  public static initializeRandomBot(params: InitializeRandomBotParams): NeuralNet {
    const { hiddens, afunction, sensors } = params;
    const outputs = GameAiEval.NN_OUTPUTS;
    const inputs = GameAiEval.NN_INPUTS_GET({ sensors });
    return NeuralNet.create({
      layerScheme: { hiddens, inputs, outputs }, afunction
    });
  }

  private sensorAsNumbers(playerIndex: number, points: SensorPoint[]): number[] {
    const { gameState: { players } } = this.game;
    const { body: { position } } = players[playerIndex];

    const numbers: number[] = [];

    for (let i = points.length; i--;) {
      const { point, type } = points[i];
      numbers.push(dist(point, position), numFromType(type));
    }

    return numbers;
  }

  /** conver output of neural net into game input */
  private inputFromNN(numbers: number[]): GameInputPlayer {
    return {
      rotate: numbers[0] * 2 - 1,
      use: numbers[1] >= .5,
      walk: numbers[2] >= .5,
      switch: numbers[3],
    }
  }

  /** Calculates all turns until all done */
  public run() {
    while (!this.done) {
      this.next()
    }
  }

  /** return's bots repsonses for current game state (used inside next) */
  public calculateBotResponse() {
    const { game } = this;
    const { gameState: { players } } = this.game;
    const sensorsResults = players.map((_, i) => this.sensorAsNumbers(i, game.sensor(i)));
    const botsNNResults = sensorsResults.map((x, i) => this.playerNNs[i].predict(x));
    const botsActions = botsNNResults.map(x => this.inputFromNN(x));

    return { players: botsActions };
  }

  /** Calculates next turn if not already done */
  public next() {
    if (this.done) {
      console.warn("GameAIRunner next called when game is already over");
      return;
    }

    const calculated = this.calculateBotResponse();

    this.game.next(calculated);
  }

  constructor(playerNNs: NeuralNet[], gameSettings: GameSettings) {
    this.playerNNs = playerNNs;
    this.game = new Game(gameSettings);
  }
}

