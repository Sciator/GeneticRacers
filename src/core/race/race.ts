import { ITrack } from "./track";
import { ICarState, ICarEnvironment, createCarEnvironment, ICarPhysicsOptions } from "./car";
import { Point } from "../types";
import { ISensorCalculationResult, calculateSenzorDetection } from "./sensor";

export type ICarRaceState = {
  carState: ICarState,
  colided?: true,
  sensors?: {
    points: Point[],
    calcResults?: ISensorCalculationResult[]
  }
}

export class Race {
  track: ITrack;
  cars: ICarRaceState[];
  carEnvironment: ICarEnvironment;

  public update(dt: number) {
    const {carEnvironment,cars,track} = this;

    cars
      .filter(x=>!x.colided)
      .forEach(car=>{
      car.carState = carEnvironment(car.carState, dt);
      if (car.sensors){
        car.sensors.calcResults = calculateSenzorDetection(track)(car.sensors.points)(car.carState);
      }
    })
  }

  constructor(track: ITrack, cars: ICarState[], options?: ICarPhysicsOptions) {
    this.track = track;
    this.cars = cars.map(x=>({carState:x}));
    this.carEnvironment = createCarEnvironment(options);
  }
}

