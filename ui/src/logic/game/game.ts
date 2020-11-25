import { Engine, World, Bodies, Query, Vector, Composite, Body } from "matter-js";
import { raycast } from "../../core/raycast";


export type GameSettings = {
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
  fire: boolean,
  switchWeapon: number,
};

export type GameInput = {
  players: GameInputPlayer[],
};


export type GameStatePlayer = {
  health: number,
  ammo: number[],
  weapon: {
    /**
     * index of selected weapon
     */
    selected: number,
    /**
     * after shooting this number is how to long it takes to shoot/swithch weapon again
     * 0 means shooting is possible
     */
    relodingTime: number,
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
  };

  public static readonly SETTINGS_DEFAULT: Readonly<GameSettings> = {
    map: {
      size: 200,
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
        fire: false, rotate: 0, switchWeapon: -1, walk: false,
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
      settings: { map: { size } },
      gameState: { players },
    } = this;
    const player = players[playerIndex];
    const playerEngineBody = this.mapping.players[playerIndex];

    const rayLengt = size * Math.pow(2, 1 / 2);

    const playerVector = Vector.create(player.position.x, player.position.y);

    const bodies = Composite.allBodies(this.world as any).filter(({ id }) => id !== playerEngineBody.id);
    return { point: raycast(bodies, playerVector, Vector.rotate(Vector.create(1, 0), player.position.angle), rayLengt)?.point };
  }

  constructor(userSettings: Partial<GameSettings> = {}) {
    // create engine
    const settings = this.settings = mergeSettings(Game.SETTINGS_DEFAULT, userSettings);
    const engine = this.engine = Engine.create();

    const world = this.world;

    world.gravity.y = 0;


    const { map: { size, borders }, game: { playerSize } } = settings;
    const center = size / 2;

    World.add(world, Bodies.rectangle(0, center, borders * 2, size, { isStatic: true }));
    World.add(world, Bodies.rectangle(size, center, borders * 2, size, { isStatic: true, angle: Math.PI }));
    World.add(world, Bodies.rectangle(center, 0, size, borders * 2, { isStatic: true, angle: Math.PI }));
    World.add(world, Bodies.rectangle(center, size, size, borders * 2, { isStatic: true }));

    const playerPadding = 5;
    const playerFromBorder = borders + playerSize + playerPadding;


    const frictionAir = .3;
    const p1 = Bodies.circle(size - playerFromBorder, playerFromBorder, playerSize, { frictionAir, angle: Math.PI * 3 / 4 });
    World.add(world, p1);
    const p2 = Bodies.circle(playerFromBorder, size - playerFromBorder, playerSize, { frictionAir, angle: Math.PI * (-1 / 4) });
    World.add(world, p2);

    this.mapping = {
      players: [p1, p2],
    };

    this.gameState = {
      players: [p1, p2].map(({ position: { x, y }, angle }) =>
        ({
          ammo: [], health: 1,
          weapon: { relodingTime: 0, selected: 0 },
          position: { x, y, angle },
        } as GameStatePlayer)),
    };
  }
}
