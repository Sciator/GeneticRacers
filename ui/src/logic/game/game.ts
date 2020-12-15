import { Engine, World, Bodies, Vector, Composite, Body, Events } from "matter-js";
import { throwReturn } from "../../core/common";
import { GameAI } from "../gameAi/GameAi";
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
    maxGameLength: number,
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


export enum EGameStateObjectType {
  player, bullet
}

export type GameStateObject = {
  /** engine body */
  body: Body,
  type: EGameStateObjectType,
  health: number,
}

export type GameStatePlayer = GameStateObject & {
  type: EGameStateObjectType.player,
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

export type GameStateBullet = GameStateObject & {
  type: EGameStateObjectType.bullet,
};

export type GameState = {
  players: GameStatePlayer[],
  bullets: GameStateBullet[],
  /** index of game winner, if -1 game isn't over yet -2 if game is draw */
  winner: number,
  timeRemaining: number,
};

export type SensorPoint = { point: Vector, type: "none" | "unknown" | EGameStateObjectType };


const mergeSettings = (s: GameSettings, t: Partial<GameSettings>): GameSettings =>
({
  ai: { ...s.ai, ...t?.ai },
  game: { ...s.game, ...t?.game },
  map: { ...s.map, ...t?.map },
  simulation: { ...s.simulation, ...t?.simulation },
});



export class Game {
  public engine: Engine;
  public settings: GameSettings;
  public gameState: GameState;

  public get world(): World { return this.engine.world; }
  public get isGameOver(): boolean { return this.gameState.winner !== -1; }

  public sensorExecutor: SensorExecutor;

  /** returns game state object from body ID */
  private getObjFromId(id: number): GameStateObject | undefined {
    const { bullets, players } = this.gameState;
    const find = (arr: GameStateObject[]) => arr.find(x => x.body.id === id);
    const player = find(players); if (player) return player;
    const bullet = find(bullets); if (bullet) return bullet;
  }


  public static readonly SETTINGS_DEFAULT: Readonly<GameSettings> = {
    // todo: move to game AI with sensors logic
    ai: {
      sensorSidesArrayAngle: (GameAI.defaultInitParams.aiParams as any).sensors,
      sensorMaxRange: 500,
    },
    map: {
      size: 300,
      borders: 10,
    },
    game: {
      playerSize: 10,
      maxGameLength: 10_000,
    },
    simulation: {
      delta: 32,
    },
  };

  // todo: check if player is not dead
  public next(userInput?: Partial<GameInput>, deltaOveride?: number) {
    const { engine, settings: { simulation: { delta: deltaSettings } }, gameState: { players }, isGameOver } = this;
    if (isGameOver) {
      console.warn("next called when game is over");
      return;
    }
    this.applyInput(userInput);

    const delta = deltaOveride || deltaSettings;
    this.gameState.timeRemaining -= delta;

    if (this.gameState.timeRemaining <= 0) {
      players.forEach(x => x.health = 0);
    }

    Engine.update(engine, delta);

    players.forEach(({ item }) => item.cooldown = Math.max(item.cooldown - delta, 0));

    this.removeDead();
    this.processBullets();
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
      const player = players[i];
      const { body } = player;
      if (x.walk) {
        let vec = Vector.rotate(Vector.create(1, 0), body.angle);
        vec = Vector.mult(vec, 5);
        Body.setVelocity(body, vec);
        player.health -= .0005
      }
      if (x.rotate !== 0) {
        Body.setAngularVelocity(body, x.rotate * .3);
        player.health -= Math.abs(x.rotate) * .005
      }
      if (x.use) {
        this.use(player);
      }
    });
  }

  private removeDead() {
    const { world, gameState } = this;

    const deadBullets = gameState.bullets.filter(({ health }) => health <= 0);
    gameState.bullets = gameState.bullets.filter(({ health }) => health > 0);

    deadBullets.forEach((x) => {
      World.remove(world, x.body);
    });

    const deadPlayers = gameState.players.map((p, i) => ({ p, i })).filter(({ p: { health } }) => health <= 0);
    const alivePlayers = gameState.players.map((p, i) => ({ p, i })).filter(({ p: { health } }) => health > 0);

    deadPlayers.forEach((x) => {
      x.p.health = 0;
      World.remove(world, x.p.body);
    });

    if (alivePlayers.length === 1) {
      this.gameState.winner = alivePlayers[0].i;
    } else if (alivePlayers.length === 0) {
      this.gameState.winner = -2;
    }
  };

  private processBullets() {
    const { gameState: { bullets } } = this;
    // todo: based on current step delta
    bullets.forEach(x => { x.health -= .01 });

    bullets.map(x => {
      const { body, health } = x;
      const { speed, velocity } = body;

      const targetSpeed = health * 10;
      const speedMult = targetSpeed / speed;

      Body.setVelocity(body, Vector.mult(velocity, speedMult));
    });
  }

  private use(player: GameStatePlayer) {
    const bulletSize = 5;
    const itemCooldown = 2000;

    // todo: check ammo 
    const { body: { position, angle }, item } = player;
    const { gameState: { bullets }, settings: { game: { playerSize } } } = this;

    if (item.cooldown !== 0)
      return;
    item.cooldown = itemCooldown;

    const distance = playerSize + bulletSize + 1;

    const one = Vector.create(1, 0);
    const angled = Vector.rotate(one, angle);
    const bulletStartPosition = Vector.add(Vector.mult(angled, distance), position);

    const { x, y } = bulletStartPosition;
    const body = Bodies.circle(x, y, bulletSize, { angle, restitution: 1 });

    World.add(this.world, body);
    Body.setVelocity(body, Vector.mult(angled, 10));

    bullets.push({
      type: EGameStateObjectType.bullet,
      health: 1,
      body,
    })

    player.health -= .1;
  }

  // todo: move all sensor related things into GameAI folder
  public sensor(playerIndex: number): SensorPoint[] {
    const { gameState: { players }, sensorExecutor, } = this;
    const { body } = players?.[playerIndex] ?? throwReturn(`Player with index ${playerIndex} not found!`);
    return sensorExecutor(body)
      .map(({ id, point }) => ({
        point,
        type:
          (id === undefined) ? "none"
            : this.getObjFromId(id)?.type
            || "unknown"
        ,
      }));
  }

  private onCollision(e: Matter.IEventCollision<Engine>) {
    const { pairs } = e;

    const processColisionPair = (pair: Matter.IPair) => {
      const bodies = [pair.bodyA, pair.bodyB];
      const objects = bodies.map(({ id }) => this.getObjFromId(id)) as GameStateObject[];
      if (objects.some(x => !x)) return;

      const bullet = objects.find(x => x.type === EGameStateObjectType.bullet) as GameStateBullet;
      const player = objects.find(x => x.type === EGameStateObjectType.player) as GameStatePlayer;

      if (bullet) {
        if (player) {
          const damage = bullet.health / 3;
          player.health -= damage;
          bullet.health -= damage;
        } else if (objects[1].type === EGameStateObjectType.bullet) {
          objects.forEach(x => x.health /= 2)
        }
      }
    }

    pairs.forEach(processColisionPair);
  }

  constructor(userSettings: Partial<GameSettings> = {}) {
    const settings = this.settings = mergeSettings(Game.SETTINGS_DEFAULT, userSettings);
    // create engine (as any for ignoring deprecated warning 
    //    - no other function to create engine known)
    this.engine = (Engine as any).create();
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
        type: EGameStateObjectType.player,
        body,
        ammo: [], health: 1,
        item: { cooldown: 0, selected: 0 },
      })
      ),
      bullets: [],
      winner: -1,
      timeRemaining: settings.game.maxGameLength,
    };

    Events.on(this.engine, "collisionStart", this.onCollision.bind(this))

    this.sensorExecutor = createSensorExecutor(this);
  }
}
