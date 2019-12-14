import { ITrack } from "./track";
import { ICarState, IFCarEnvironment, createCarEnvironment, ICarPhysicsOptions, ICarInputs, carInputsSetter } from "./car";
import { Point } from "../types";
import { ISensorCalculationResult, calculateSensorDetection } from "./sensor";
import { range, zip } from "../common";

const collisionMinDist = 5;
const checkpointMinDist = 20;

export enum ERaceCarRaceState { crashed, finished, racing }

export type IRaceCarState = {
  readonly carState: ICarState,
  readonly currentCheckpoint: number,
  readonly raceState: ERaceCarRaceState,
}

export type IRaceState = {
  readonly track: ITrack;
  readonly cars: IRaceCarState[];
}

export type IRaceInit = {
  readonly track: ITrack;
  readonly numOfCars: number;
}


export const calculateCheckpointDistance = (checkpoints: Point[]) => (car: IRaceCarState) => {
  const { currentCheckpoint, carState: { pos } } = car;
  const ci = currentCheckpoint;
  if (ci >= checkpoints.length)
    return -1;

  return checkpoints[ci].distance(pos);
}



export const raceInit = ({ numOfCars, track }: IRaceInit): IRaceState => {
  const cars = range(numOfCars).map(() =>
    ({
      currentCheckpoint: 1,
      raceState: ERaceCarRaceState.racing,
      carState: {
        heading: new Point({ x: 0, y: -1 }),
        pos: track.checkpoints[0],
        velocity: new Point({ x: 0, y: 0 }),

        engineOn: false,
        turnDirection: 0,
      }
    } as IRaceCarState));

  return { cars, track }
}

export const raceEvaluator = (carEnv: IFCarEnvironment) => (state: IRaceState, dt: number) => {
  const { track: { road: { lines: roads } } } = state;

  const calcCarCheckpointDist = calculateCheckpointDistance(state.track.checkpoints);

  const isCarCrashed = (car: ICarState) => {
    const { pos } = car;
    for (let i = 0; i < roads.length; i++) {
      const r = roads[i];
      if (r.distanceFromPoint(pos) <= collisionMinDist)
        return true;
    }
    return false;
  }

  const cars = state.cars.map(car => {
    if (car.raceState !== ERaceCarRaceState.racing)
      return car;

    const carState = carEnv(car.carState, dt);

    const carCheckpointDist = calcCarCheckpointDist(car);

    const currentCheckpoint = carCheckpointDist <= checkpointMinDist ? car.currentCheckpoint + 1 : car.currentCheckpoint

    const raceState = currentCheckpoint === state.track.checkpoints.length
      ? ERaceCarRaceState.finished
      : isCarCrashed(car.carState)
        ? ERaceCarRaceState.crashed
        : ERaceCarRaceState.racing
      ;

    return { carState, currentCheckpoint, raceState } as IRaceCarState;
  })

  const newState: IRaceState = {
    track: state.track,
    cars
  }
}


export const raceInputSetter = (state: IRaceState, inputs: ICarInputs[]): IRaceState => {
  const { track } = state;
  const cars = zip(state.cars, inputs).map(([car, input]) =>
    ({ ...car, carState: carInputsSetter(car.carState, input), })
  );
  return {
    cars, track
  }
}