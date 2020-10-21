import { Car, ICarInputs } from "./car";
import { Track } from "./track";
import { Point, Line } from "../../core/types";

export enum ERaceCarRaceState { crashed = "crashed", finished = "finished", racing = "racing" }

const collisionMinDist = 1;
const checkpointMinDist = 30;


type IRaceCarState = {
  carState: Car,
  currentCheckpoint: number,
  currentScore: number,
  raceState: ERaceCarRaceState,
};


export class RaceCar {
  public readonly carState: Car;
  /** checkpoint car currently heading to */
  public readonly currentCheckpoint: number;
  public readonly currentScore: number;
  public readonly raceState: ERaceCarRaceState;

  public setInput(input: ICarInputs) {
    return new RaceCar({ ...this, carState: this.carState.setInput(input) });
  }

  public update(track: Track, dt: number) {
    const { road: { lines: roads }, checkpoints } = track;
    const { carState, currentCheckpoint, raceState } = this;

    if (raceState !== ERaceCarRaceState.racing)
      return this;

    const newCarState: IRaceCarState = { ...this };

    newCarState.carState = carState.update(dt);

    const carCheckpointDist = RaceCar.calculateCheckpointDistance(newCarState, checkpoints);

    newCarState.currentCheckpoint =
      carCheckpointDist <= checkpointMinDist
        ? currentCheckpoint + 1
        : currentCheckpoint
      ;

    newCarState.raceState = currentCheckpoint === track.checkpoints.length
      ? ERaceCarRaceState.finished
      : RaceCar.calculateIsCarCrashed(roads, newCarState.carState)
        ? ERaceCarRaceState.crashed
        : ERaceCarRaceState.racing
      ;

    newCarState.currentScore = RaceCar.raceGetCurrentScore(newCarState, checkpoints);

    return new RaceCar(newCarState);
  }


  private static calculateCheckpointDistance(car: IRaceCarState, checkpoints: Point[]) {
    const { currentCheckpoint, carState: { state: { pos } } } = car;
    const ci = currentCheckpoint;
    if (ci >= checkpoints.length)
      return -1;

    return checkpoints[ci].distance(pos);
  }

  private static calculateIsCarCrashed(roads: Line[], car: Car) {
    const { state: { pos } } = car;
    for (const r of roads) {
      if (r.distanceFromPoint(pos) <= collisionMinDist)
        return true;
    }
    return false;
  }

  private static raceGetCurrentScore(carState: IRaceCarState, checkpoints: Point[]) {
    const { currentCheckpoint: currentCheckpointIndex, raceState, carState: { state: { pos } } } = carState;

    if (raceState === ERaceCarRaceState.finished || currentCheckpointIndex >= checkpoints.length)
      return 1;
    const currentCheckpoint = checkpoints[currentCheckpointIndex];

    const pointsPerCheckpoint = 1 / (checkpoints.length - 1/* first checkpoint is start */);

    const pointsDoneCheckpoints = pointsPerCheckpoint * (currentCheckpointIndex - 1);

    const distToCurrent = pos.distance(currentCheckpoint);
    const distFromPrevToCurrent = currentCheckpoint.distance(checkpoints[currentCheckpointIndex - 1]);

    const pointsDistToCurrent = pointsPerCheckpoint - (distToCurrent / distFromPrevToCurrent) * pointsPerCheckpoint;

    return pointsDoneCheckpoints + pointsDistToCurrent;
  }

  public static create(carState: Car) {
    return new RaceCar({ carState, currentCheckpoint: 0, currentScore: 0, raceState: ERaceCarRaceState.racing });
  }

  private constructor(params: IRaceCarState) {
    const { carState, currentCheckpoint, currentScore, raceState } = params;
    this.carState = carState;
    this.currentCheckpoint = currentCheckpoint;
    this.currentScore = currentScore;
    this.raceState = raceState;
  }
}
