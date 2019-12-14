import { ITrack } from "./track";
import { ICarState, ICarEnvironment, createCarEnvironment, ICarPhysicsOptions } from "./car";
import { Point } from "../types";
import { ISensorCalculationResult, calculateSenzorDetection } from "./sensor";

const collisionDist = 5;
const checkpointDist = 20;

export type ICarRaceState = {
  carState: ICarState,
  currentCheckpointDist: number,
  currentCheckpoint: number,
  raceState?: "colided" | "done",
  sensors?: {
    points: Point[],
    calcResults?: ISensorCalculationResult[]
  }
}

export class Race {
  track: ITrack;
  cars: ICarRaceState[];
  carEnvironment: ICarEnvironment;

  public calculateCheckpoint() {
    const { cars, track: { checkpoints } } = this;
    cars.filter(car => car.raceState === undefined)
      .forEach(car => {
        const { currentCheckpoint, carState: { pos } } = car;
        const c = checkpoints[currentCheckpoint + 1];

        car.currentCheckpointDist = c.distance(pos);
        if (car.currentCheckpointDist <= checkpointDist) {
          car.currentCheckpoint++;
          if (car.currentCheckpoint === checkpoints.length-1)
            car.raceState = "done";
        }

      });
  }

  private calculateCollisions() {
    const { cars, track: { road: { lines: roads } } } = this;

    cars
      .filter(car => car.raceState === undefined)
      .forEach(car => {
        const { carState: { pos } } = car;
        roads.forEach(r => {
          if (r.distanceFromPoint(pos) <= collisionDist)
            car.raceState = "colided";
        });
      });
  }

  public update(dt: number) {
    const { carEnvironment, cars, track } = this;

    this.calculateCollisions();
    this.calculateCheckpoint();

    cars
      .filter(x => x.raceState === undefined)
      .forEach(car => {
        car.carState = carEnvironment(car.carState, dt);
        if (car.sensors) {
          car.sensors.calcResults = calculateSenzorDetection(track)(car.sensors.points)(car.carState);
        }
      })
  }

  constructor(track: ITrack, cars: ICarState[], options?: ICarPhysicsOptions) {
    this.track = track;
    this.cars = cars.map(x => ({ carState: x, currentCheckpoint: 0, currentCheckpointDist: Infinity }));
    this.carEnvironment = createCarEnvironment(options);
  }
}

