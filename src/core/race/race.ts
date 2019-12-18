import { ITrack } from "./track";
import { ICarState, IFCarEnvironment, ICarInputs, carInputsSetter } from "./car";
import { Point } from "../types";

const collisionMinDist = 5;
const checkpointMinDist = 20;

export enum ERaceCarRaceState { crashed = "crashed", finished = "finished", racing = "racing" }

export type IRaceCarState = {
  readonly carState: ICarState,
  /** checkpoint car currently heading to */
  readonly currentCheckpoint: number,
  readonly raceState: ERaceCarRaceState,
};

export type IRaceState = {
  readonly track: ITrack;
  readonly car: IRaceCarState;
};

export type IRaceInit = {
  readonly track: ITrack;
};

export const calculateCheckpointDistance = (checkpoints: Point[]) => (car: IRaceCarState) => {
  const { currentCheckpoint, carState: { pos } } = car;
  const ci = currentCheckpoint;
  if (ci >= checkpoints.length)
    return -1;

  return checkpoints[ci].distance(pos);
};

export const raceInit = ({ track }: IRaceInit): IRaceState => ({
  track,
  car: {
    currentCheckpoint: 1,
    raceState: ERaceCarRaceState.racing,
    carState: {
      heading: new Point({ x: 0, y: -1 }),
      pos: track.checkpoints[0],
      velocity: new Point({ x: 0, y: 0 }),

      engineOn: false,
      turnDirection: 0,
    },
  },
});


export const evalRace = (carEnv: IFCarEnvironment) => (state: IRaceState, dt: number) => {
  const { track: { road: { lines: roads } } } = state;

  const calcCarCheckpointDist = calculateCheckpointDistance(state.track.checkpoints);

  const isCarCrashed = (car: ICarState) => {
    const { pos } = car;
    for (const i of Array(roads.length)) {
      const r = roads[i];
      if (r.distanceFromPoint(pos) <= collisionMinDist)
        return true;
    }
    return false;
  }

  const car = ((car) => {
    if (car.raceState !== ERaceCarRaceState.racing)
      return car;

    const carState = carEnv(car.carState, dt);

    const carCheckpointDist = calcCarCheckpointDist(car);

    const currentCheckpoint =
      carCheckpointDist <= checkpointMinDist
        ? car.currentCheckpoint + 1
        : car.currentCheckpoint
      ;

    const raceState = currentCheckpoint === state.track.checkpoints.length
      ? ERaceCarRaceState.finished
      : isCarCrashed(car.carState)
        ? ERaceCarRaceState.crashed
        : ERaceCarRaceState.racing
      ;

    return { carState, currentCheckpoint, raceState } as IRaceCarState;
  })(state.car);

  const newState: IRaceState = {
    track: state.track,
    car,
  };
  return newState;
};


export const raceInputSetter = (state: IRaceState, inputs: ICarInputs): IRaceState => ({
  track: state.track,
  car: { ...state.car, carState: carInputsSetter(state.car.carState, inputs), },
});


const maxScore = 1000;

export const raceGetCurrentScore = (state: IRaceState) => {
  const {
    track: { checkpoints },
    car: { currentCheckpoint: currentCheckpointIndex, raceState, carState: { pos } } } = state;

  if (raceState === ERaceCarRaceState.finished)
    return maxScore;
  const currentCheckpoint = checkpoints[currentCheckpointIndex];

  const pointsPerCheckpoint = maxScore / (checkpoints.length - 1/* first checkpoint is start */);

  const pointsDoneCheckpoints = pointsPerCheckpoint * (currentCheckpointIndex - 1);

  const distToCurrent = pos.distance(currentCheckpoint);
  const distFromPrevToCurrent = currentCheckpoint.distance(checkpoints[currentCheckpointIndex - 1]);

  const pointsDistToCurrent = (distToCurrent / distFromPrevToCurrent) * pointsPerCheckpoint;

  return pointsDoneCheckpoints + pointsDistToCurrent;
};
