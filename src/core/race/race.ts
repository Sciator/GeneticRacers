import { ITrack, Track } from "./track";
import { ICarInputs, Car, ICarPhysicsOptions } from "./car";
import { Point } from "../types";
import { RaceCar, ERaceCarRaceState } from "./raceCar";
import { zip, range } from "../common";



export type IRaceState = {
  readonly track: Track;
  readonly cars: readonly RaceCar[];
};

export type IRaceInit = {
  readonly physics?: ICarPhysicsOptions,
  readonly track: ITrack,
  readonly numCars: number,
};


export class Race {
  public readonly cars: readonly RaceCar[];
  public readonly track: Track;

  public get isEnded() {
    return this.cars.every(x => x.raceState !== ERaceCarRaceState.racing);
  }

  public setInputs(inputs: ICarInputs[]): Race {
    const { cars, track } = this;
    return new Race({
      track,
      cars: zip(cars, inputs).map(([c, i]) => c.setInput(i)),
    });
  }

  public update(dt: number): Race {
    const { cars, track } = this;
    return new Race({
      track,
      cars: cars.map(x => x.update(track, dt)),
    });
  }

  public static create(init: IRaceInit) {
    const { numCars, physics, track } = init;

    const car = RaceCar.create(
      Car.create({
        physics,
        state: {
          heading: new Point({ x: 0, y: -1 }),
          pos: track.checkpoints[0],
        },
      }));

    return new Race({
      track,
      cars: range(numCars).map(_ => car),
    });
  }


  private constructor(state: IRaceState) {
    const { cars, track } = state;
    this.cars = cars;
    this.track = track;
  }
}


