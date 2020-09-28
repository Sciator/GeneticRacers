import { Point } from "../../core/types";
// source: https://github.com/chipbell4/car-physics

const BEST_TURN_SPEED = 0.25;
const TURN_AT_TOP_SPEED = 0.5;

export const defaultDT = 0.05;

export type ICarPhysicsOptions = {
  topSpeed?: number,
  acceleration?: number,
  handling?: number,
  traction?: number,
  friction?: number,
};

type ICarPhysics = {
  readonly topSpeed: number,
  readonly acceleration: number,
  readonly handling: number,
  readonly traction: number,
  readonly friction: number,
} & ICarPhysicsOptions;

const defaultCarPhysicsOptions: ICarPhysics = {
  acceleration: 250,
  friction: .2,
  handling: 3,
  topSpeed: 400,
  traction: 2,
};

export type ICarState = {
  readonly pos: Point,
  readonly velocity: Point,
  readonly heading: Point,
  readonly turnDirection: 0 | 1 | -1,
  readonly engineOn: boolean,
};

export type ICarStateInit = {
  readonly pos: Point,
  readonly velocity?: Point,
  readonly heading: Point,
  readonly turnDirection?: 0 | 1 | -1,
  readonly engineOn?: boolean,
};

type ICarStateMutable = {
  pos: Point,
  velocity: Point,
  heading: Point,
  turnDirection: 0 | 1 | -1,
  engineOn: boolean,
};

export enum ETurnDirection { left = -1, right = 1, straight = 0 }

export type ICarInputs = { engineOn: boolean, turnDirection: ETurnDirection };


export type ICarInit = {
  physics?: ICarPhysicsOptions,
  state: ICarStateInit,
};

export class Car {
  public readonly physics: ICarPhysics;
  public readonly state: ICarState;

  public setInput(input: ICarInputs): Car {
    const { engineOn, turnDirection } = input;
    const state = { ...this.state, engineOn, turnDirection };

    return new Car({ state, physics: this.physics });
  }

  public update(dt: number): Car {
    const { physics } = this;
    const out = Car.carStateMutableCopy(this.state);

    Car.applyVelocity(out, dt);
    Car.updateTurn(physics, out, dt);
    Car.applyAcceleration(physics, out, dt);
    Car.applyFriction(physics, out, dt);
    Car.applyTraction(physics, out, dt);
    return new Car({ physics, state: out });
  }


  //
  //#region Physics
  //

  private static carStateMutableCopy(car: ICarState) { return ({ ...car }); }


  private static updateTurn(physics: ICarPhysics, car: ICarStateMutable, dt: number) {
    const { handling, topSpeed } = physics;
    const { velocity, turnDirection, heading } = car;

    // if we"re turning, apply a turn direction by rotating the D vector
    let rotationalVelocity = 0;
    // base the amount of rotation based on percentage of top speed. (See the constants above)
    const percentageSpeed = velocity.magnitude / topSpeed;

    if (percentageSpeed < BEST_TURN_SPEED) {
      rotationalVelocity = percentageSpeed / BEST_TURN_SPEED * handling;
    } else {
      // Handling decreases from full handling to a percentage at top speed.
      const slope = handling * (1 - TURN_AT_TOP_SPEED) / (BEST_TURN_SPEED - 1);
      const intercept = handling - slope * BEST_TURN_SPEED;
      rotationalVelocity = intercept + slope * percentageSpeed;
    }

    // set rotation velocity based on turn direction
    rotationalVelocity *= turnDirection;

    car.heading = heading.rotateRad(rotationalVelocity * dt);
  }

  private static applyVelocity(car: ICarStateMutable, dt: number) {
    const { velocity, pos } = car;
    car.pos = pos.plus(velocity.multiply(dt));
  }

  private static applyAcceleration(physics: ICarPhysics, car: ICarStateMutable, dt: number) {
    const { acceleration, topSpeed } = physics;
    const { engineOn, velocity } = car;

    // If the thruster is off, break out
    // or we"re at the top speed don"t accelerate
    if ((!engineOn) || (velocity.magnitude >= topSpeed)) return;


    car.velocity = car.heading.multiply(dt * acceleration);
  }

  private static applyFriction(physics: ICarPhysics, car: ICarStateMutable, dt: number) {
    const { friction } = physics;
    const { engineOn, velocity } = car;
    // Dont apply friction if the thruster is on
    if (engineOn) return;

    car.velocity = velocity.multiply(Math.pow(1 - friction, dt));
  }

  private static applyTraction(physics: ICarPhysics, car: ICarStateMutable, dt: number) {
    const { traction } = physics;
    // if the car isn"t moving, break out
    if (car.velocity.magnitude < 0.001) {
      return;
    }

    // calculate the angle between the direction and velocity vector (using the cross product)
    const dCrossV = car.heading.x * car.velocity.y - car.velocity.x * car.heading.y;
    const sinTheta = dCrossV / car.heading.magnitude / car.velocity.magnitude;
    const theta = Math.asin(sinTheta);

    // traction is an angular velocity that will determine how quickly the velocity vector can realign with direction
    // (just like tires do).
    let amountToCorrect = dt * traction * (-Math.sign(theta));

    // If the amount of correction needed is less that what traction could do, we"ll just realign
    if (Math.abs(theta) < amountToCorrect) amountToCorrect = -theta;


    // now "fix" velocity by rotating it a little
    car.velocity = car.velocity.rotateRad(amountToCorrect);
  }

  //
  //#endregion
  //


  public static create({ physics: opts, state: steteInit }: ICarInit) {
    const physics = { ...defaultCarPhysicsOptions, ...(opts || {}) };
    const state: ICarState = {
      engineOn: false, velocity: new Point({ x: 0, y: 0 }), turnDirection: 0,
      ...steteInit,
    };

    if (state.heading.magnitude === 0) throw new Error("invalid car heading");

    return new Car({ physics, state });
  }

  private constructor({ physics, state }: { physics: ICarPhysics, state: ICarState }) {
    this.physics = physics;
    this.state = state;
  }

}


