import { Engine, World, Bodies, Vector, Composite, Body } from "matter-js";
import { throwReturn } from "../../core/common";
import { createSensorExecutor, SensorExecutor } from "./sensors";

const frictionAir = .3;

export type BodyType = "wall" | "player" | "bullet" | "obstacle";

export type GameSettings = {
  ai: {
    sensorSidesArrayAngle: number[],
    sensorMaxRange: number,
  },
  game: {
    playerSize: number,
  },
  map: {
    size: number,
    borders: number,
  },
  simulation: {
    delta: number,
  },
};


export type GameInputPlayer = {
  walk: boolean,
  rotate: number,
  /** use item/fire weapon */
  use: boolean,
  /** select item/weapon */
  switch: number,
};

export type GameInput = {
  players: GameInputPlayer[],
};


export type GameStatePlayer = {
  /** player body id inside engine */
  body: Body,
  health: number,
  ammo: number[],
  item: {
    /**
     * index of selected item/weapon
     */
    selected: number,
    /**
     * after shooting this number is how to long it takes to shoot/use/swithch item/weapon again
     * 0 means shooting is possible
     */
    cooldown: number,
  },
};

export type GameState = {
  players: GameStatePlayer[],
};


const mergeSettings = (s: GameSettings, t: Partial<GameSettings>): GameSettings =>
  ({
    ai: { ...s.ai, ...t?.ai },
    game: { ...s.game, ...t?.game },
    map: { ...s.map, ...t?.map },
    simulation: { ...s.simulation, ...t?.simulation },
  });


export class Game {
  public engine: Engine;
  public get world(): World { return this.engine.world; }
  public settings: GameSettings;
  public gameState: GameState;

  public sensorExecutor: SensorExecutor;



  public static readonly SETTINGS_DEFAULT: Readonly<GameSettings> = {
    ai: {
      sensorSidesArrayAngle: [Math.PI * 1 / 4, Math.PI * 1 / 8, Math.PI * 1 / 32],
      sensorMaxRange: 200,
    },
    map: {
      size: 300,
      borders: 10,
    },
    game: {
      playerSize: 10,
    },
    simulation: {
      delta: 32,
    },
  };

  public next(userInput?: Partial<GameInput>) {
    const { engine, settings: { simulation: { delta } } } = this;
    this.applyInput(userInput);

    Engine.update(engine, delta);
  }

  /** applies changes to object based on user input */
  private applyInput(userInput?: Partial<GameInput>) {
    const { gameState: { players } } = this;

    const mergeInput = () => ({
      players: this.gameState.players.map((_, i) => ({
        use: false, rotate: 0, switch: -1, walk: false,
        ...(userInput?.players?.[i]),
      })),
    });

    const { players: playersInputs } = mergeInput();

    playersInputs.forEach((x, i) => {
      const { body } = players[i];
      if (x.walk) {
        let vec = Vector.rotate(Vector.create(1, 0), body.angle);
        vec = Vector.mult(vec, 5);
        Body.setVelocity(body, vec);
      }
      if (x.rotate !== 0) {
        Body.setAngularVelocity(body, x.rotate * .3);
      }
    });
  }


  public sensor(playerIndex: number) {
    const { gameState: { players }, sensorExecutor, } = this;
    const { body } = players?.[playerIndex] ?? throwReturn(`Player with index ${playerIndex} not found!`);
    return sensorExecutor(body);
  }

  constructor(userSettings: Partial<GameSettings> = {}) {
    const settings = this.settings = mergeSettings(Game.SETTINGS_DEFAULT, userSettings);
    // create engine
    this.engine = Engine.create();
    const world = this.world;

    world.gravity.y = 0;

    const { map: { size, borders }, game: { playerSize } } = settings;
    const center = size / 2;
    const playerPadding = 5;
    const playerFromBorder = borders + playerSize + playerPadding;

    const walls = [
      Bodies.rectangle(0, center, borders * 2, size, { isStatic: true }),
      Bodies.rectangle(size, center, borders * 2, size, { isStatic: true, angle: Math.PI }),
      Bodies.rectangle(center, 0, size, borders * 2, { isStatic: true, angle: Math.PI }),
      Bodies.rectangle(center, size, size, borders * 2, { isStatic: true }),
    ];
    World.add(world, walls);

    const players = [
      Bodies.circle(size - playerFromBorder, playerFromBorder, playerSize, { frictionAir, angle: Math.PI * 3 / 4 }),
      Bodies.circle(playerFromBorder, size - playerFromBorder, playerSize, { frictionAir, angle: Math.PI * (-1 / 4) }),
    ];
    World.add(world, players);

    this.gameState = {
      players: players.map((body) =>
        ({
          body,
          ammo: [], health: 1,
          item: { cooldown: 0, selected: 0 },
        } as GameStatePlayer)),
    };



    this.sensorExecutor = createSensorExecutor(this);
  }
}
