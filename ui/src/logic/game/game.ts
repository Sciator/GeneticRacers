import { Engine, World, Bodies, Query, Vector, Composite, Body } from "matter-js";
import { raycast } from "../../core/raycast";

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
  position: {
    x: number,
    y: number,
    angle: number,
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
  public get world(): World { return this.engine.world; };
  public settings: GameSettings;
  public gameState: GameState;

  public mapping: {
    /** index of body in this array is same with index in game state */
    players: Matter.Body[],
    walls: Matter.Body[],
  };

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
    const { engine, settings: { simulation: { delta } }, mapping } = this;
    this.applyInput(userInput);

    Engine.update(engine, delta);

    this.synchronizeGamesState();
  }

  /** applies changes to object based on user input */
  private applyInput(userInput?: Partial<GameInput>) {
    const { mapping } = this;

    const mergeInput = () => ({
      players: this.gameState.players.map((_, i) => ({
        use: false, rotate: 0, switch: -1, walk: false,
        ...(userInput?.players?.[i]),
      })),
    });

    const { players } = mergeInput();

    players.forEach((x, i) => {
      const body = mapping.players[i];
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

  /** apply changes from engine into gameState prop */
  private synchronizeGamesState() {
    const { mapping } = this;

    this.gameState.players.forEach((x, i) => {
      const body = mapping.players[i];
      x.position.x = body.position.x;
      x.position.y = body.position.y;
      x.position.angle = body.angle;
    });
  }


  public sensor(playerIndex: number) {
    const {
      settings: {
        map: { size },
        ai: {
          sensorMaxRange, sensorSidesArrayAngle,
        } },
      gameState: { players },
    } = this;
    const player = players[playerIndex];
    const playerEngineBody = this.mapping.players[playerIndex];

    const sensorAngles = [0]
      .concat(sensorSidesArrayAngle)
      .concat(sensorSidesArrayAngle.map(x => -x))
      .map(x => player.position.angle + x)
      ;

    const rayRange = Math.min(size * Math.pow(2, 1 / 2), sensorMaxRange);
    const playerVector = Vector.create(player.position.x, player.position.y);
    const bodies = Composite.allBodies(this.world as any).filter(({ id }) => id !== playerEngineBody.id);

    return sensorAngles.map(x => {
      const ray = raycast(bodies, playerVector, Vector.rotate(Vector.create(1, 0), x), rayRange);
      if (!ray?.point)
        return Vector.add(playerVector, Vector.mult(Vector.normalise(Vector.rotate(Vector.create(1, 0), x)), rayRange));
      else
        return ray.point;
    });
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

    this.mapping = {
      players,
      walls,
    };

    this.gameState = {
      players: players.map(({ position: { x, y }, angle }) =>
        ({
          ammo: [], health: 1,
          item: { cooldown: 0, selected: 0 },
          position: { x, y, angle },
        } as GameStatePlayer)),
    };
  }
}
