import { Point } from "../types";
//source: https://github.com/chipbell4/car-physics

const BEST_TURN_SPEED = 0.3;
const TURN_AT_TOP_SPEED = 0.75;

export type ICarPhysicsOptions = {
  readonly topSpeed?: number,
  readonly acceleration?: number,
  readonly handling?: number,
  readonly traction?: number,
  readonly friction?: number,
};

const defaultCarPhysicsOptions = {
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
}

type ICarStateMutable = {
  pos: Point,
  velocity: Point,
  heading: Point,
  turnDirection: 0 | 1 | -1,
  engineOn: boolean,
}

export enum ETurnDirection { left = -1, right = 1, straight = 0 }

export type IFCarEnvironment = (car: ICarState, dt: number) => ICarState;

const carStateMutableCopy = (car: ICarState) => ({ ...car });

export type ICarInputs = { engineOn: boolean, turnDirection: ETurnDirection };

export const carInputsSetter = (car: ICarState, { engineOn, turnDirection }: ICarInputs): ICarState =>
  ({ ...car, engineOn, turnDirection: turnDirection });

export const createCarEnvironment = (opt?: ICarPhysicsOptions): IFCarEnvironment => {
  const { acceleration, friction, handling, topSpeed, traction } = { ...defaultCarPhysicsOptions, ...(opt || {}) };

  const updateTurn = (car: ICarStateMutable, dt: number) => {
    const { velocity, turnDirection, heading } = car;

    // if we"re turning, apply a turn direction by rotating the D vector
    let rotationalVelocity = 0;
    // base the amount of rotation based on percentage of top speed. (See the constants above)
    let percentageSpeed = velocity.magnitude / topSpeed;

    if (percentageSpeed < BEST_TURN_SPEED) {
      rotationalVelocity = percentageSpeed / BEST_TURN_SPEED * handling;
    } else {
      // Handling decreases from full handling to a percentage at top speed.
      let slope = handling * (1 - TURN_AT_TOP_SPEED) / (BEST_TURN_SPEED - 1);
      let intercept = handling - slope * BEST_TURN_SPEED;
      rotationalVelocity = intercept + slope * percentageSpeed;
    }

    // set rotation velocity based on turn direction
    rotationalVelocity *= turnDirection;

    car.heading = heading.rotateRad(rotationalVelocity * dt);
  };

  const applyVelocity = (car: ICarStateMutable, dt: number) => {
    const { velocity, pos } = car;
    car.pos = pos.plus(velocity.multiply(dt));
  };

  const applyAcceleration = (car: ICarStateMutable, dt: number) => {
    const { engineOn, velocity } = car;

    // If the thruster is off, break out
    // or we"re at the top speed don"t accelerate
    if ((!engineOn) || (velocity.magnitude >= topSpeed))
      return;


    car.velocity = car.heading.multiply(dt * acceleration);
  };

  const applyFriction = (car: ICarStateMutable, dt: number) => {
    const { engineOn, velocity } = car;
    // Dont apply friction if the thruster is on
    if (engineOn)
      return;

    car.velocity = velocity.multiply(Math.pow(1 - friction, dt));
  };

  const applyTraction = (car: ICarStateMutable, dt: number) => {
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
    if (Math.abs(theta) < amountToCorrect)
      amountToCorrect = -theta;


    // now "fix" velocity by rotating it a little
    car.velocity = car.velocity.rotateRad(amountToCorrect);
  };

  return (car: ICarState, dt: number) => {
    if (car.heading.magnitude === 0)
      throw new Error("invalid car heading");

    let out = carStateMutableCopy(car);
    applyVelocity(out, dt);
    updateTurn(out, dt);
    applyAcceleration(out, dt);
    applyFriction(out, dt);
    applyTraction(out, dt);
    // console.log(out)
    return out;
  };
}
