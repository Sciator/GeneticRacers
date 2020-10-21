import { Track } from "../race/track";
import { Point } from "../../core/types";
import { Race } from "../race/race";
import { NeuralNet, IANNData } from "../ai/nn/nn";
import { Sensors } from "./sensor";
import { ICarPhysicsOptions, ETurnDirection, ICarInputs } from "../race/car";
import { zip } from "../../core/common";

export type ISimParamsOptions = {
  dt?: number,
  maxTime?: number,
};

type ISimParams = {
  dt: number,
  maxTime: number,
};

const simParamsDefaults: ISimParams = {
  dt: 0.05,
  maxTime: 10,
};

export type IRaceNNArg = {
  track: Track,
  sensors: Point[],
  nn: IANNData,
  dt?: number,
  maxTime?: number,
  carPhysics?: ICarPhysicsOptions,
};

export type IRaceNNState = {
  race: Race,
  nns: readonly NeuralNet[],
  simParams: ISimParamsOptions,
  sensors: Sensors,
};

export class RaceNN {
  public readonly race: Race;
  public readonly nns: readonly NeuralNet[];
  public readonly simParams: ISimParams;
  public readonly sensors: Sensors;

  public evalRace() {
    const { simParams: { dt, maxTime } } = this;
    let race = this.race;
    let time = 0;

    while (time < maxTime && !race.isEnded) {
      time += dt;
      race = this.evalRaceStep(race);
    }

    return race;
  }

  public evalHistory() {
    const { simParams: { dt, maxTime } } = this;
    let race = this.race;
    const hist = [race];
    let time = 0;

    while (time < maxTime && !race.isEnded) {
      time += dt;
      race = this.evalRaceStep(race);
      hist.push(race);
    }

    return hist;
  }

  private evalRaceStep(race: Race): Race {
    const { sensors, nns, simParams: { dt } } = this;
    const { cars, track } = race;

    const inputs: ICarInputs[] = zip(cars, nns).map(([c, nn]) => {
      const sensorResultsMapped = sensors.calculateSensorDetection(track, c.carState.state).map(x => x.nearestMapped);
      const nnResult = nn.predict(sensorResultsMapped)
        .map(Math.round)
        .map(x => x === 1)
        ;
      const { left, right, straight } = ETurnDirection;
      const engineOn = nnResult[0];
      const turnDirection =
        nnResult[1]
          ? nnResult[2]
            ? straight
            : left
          : right
        ;
      return { engineOn, turnDirection };
    });

    return race.setInputs(inputs).update(dt);
  }

  constructor(state: IRaceNNState) {
    const { nns, race, simParams, sensors } = state;
    this.nns = nns;
    this.race = race;
    this.simParams = { ...simParamsDefaults, ...simParams };
    this.sensors = sensors;
  }
}

