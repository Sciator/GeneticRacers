import { ITrack } from "./track";
import { ICarState, ICarEnvironment, createCarEnvironment, ICarPhysicsOptions } from "./car";
import { Point } from "../types";
import { ISensorCalculationResult, calculateSenzorDetection } from "./sensor";

const collisionDist = 5;

export type ICarRaceState = {
  carState: ICarState,
  collided?: true,
  sensors?: {
    points: Point[],
    calcResults?: ISensorCalculationResult[]
  }
}

export class Race {
  track: ITrack;
  cars: ICarRaceState[];
  carEnvironment: ICarEnvironment;

  public calculateCollisions() {
    const { cars, track: { road: { lines: roads } } } = this;

    cars
      .filter(car => !car.collided)
      .forEach(car => {
        const {carState:{pos}}=car;
        roads.forEach(r => {
          if (r.distanceFromPoint(pos)<=collisionDist)
            car.collided = true;
        });
      });
  }

  public update(dt: number) {
    const { carEnvironment, cars, track } = this;

    this.calculateCollisions();

    cars
      .filter(x => !x.collided)
      .forEach(car => {
        car.carState = carEnvironment(car.carState, dt);
        if (car.sensors) {
          car.sensors.calcResults = calculateSenzorDetection(track)(car.sensors.points)(car.carState);
        }
      })
  }

  constructor(track: ITrack, cars: ICarState[], options?: ICarPhysicsOptions) {
    this.track = track;
    this.cars = cars.map(x => ({ carState: x }));
    this.carEnvironment = createCarEnvironment(options);
  }
}

