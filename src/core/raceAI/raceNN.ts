import { Track } from "../race/track";
import { Point } from "../types";
import { IANNActivationFunction } from "../AI/nn/nnActivationFunctions";
import { IRaceCarState, raceInit, ERaceCarRaceState, evalRace, raceInputSetter, IRaceState, Race } from "../race/race";
import { NeuralNet, IANNData } from "../AI/nn/nn";
import { calculateSensorDetection, Sensors } from "./sensor";
import { createCarEnvironment, ICarPhysicsOptions, ETurnDirection, ICarInputs } from "../race/car";
import { zip } from "../common";

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

export type IRaceNNRes = {
  track: Track,
  car: IRaceCarState,
};


export type ICreateRaceNeuralNet = {
  numSensors: number,
  nnInit: {
    hiddenLayers: number[],
    afunction?: {
      hidden: IANNActivationFunction,
      output: IANNActivationFunction,
    },
  },
};

export const createRaceNN = (args: ICreateRaceNeuralNet) => {
  const { numSensors: inputs, nnInit: { afunction, hiddenLayers: hiddens } } = args;
  return NeuralNet.nnCreate({
    layerScheme: {
      inputs,
      hiddens,
      outputs: 3,
    },
    afunction,
  });
};

export type IRaceNNHist = {
  race: IRaceState, history: IRaceState[], dt: number
};

export const evalRaceNN = (args: IRaceNNArg): IRaceNNHist => {
  const { dt, maxTime, nn: nnParams, sensors, track, carPhysics } =
    { ...raceNNDefaults, ...args, carPhysics: { acceleration: 300 } };

  const nn = NeuralNet.nnPredicter(nnParams);
  const evalSensor = calculateSensorDetection(track)(sensors);
  const carEnv = createCarEnvironment(carPhysics);

  let race = raceInit({ track });
  let time = 0;

  const history = [race];

  while (time < maxTime && race.cars.raceState === ERaceCarRaceState.racing) {
    const sensorStateMapped = evalSensor(race.cars.carState).map((x) => x.nearestMapped);
    const nnRes = nn(sensorStateMapped)
      .map(Math.round)
      .map(x => x === 1)
      ;

    const { left, right, straight } = ETurnDirection;
    const engineOn = nnRes[0];
    const turnDirection =
      (nnRes[1])
        ? nnRes[2] ?
          straight
          : left
        : nnRes[1]
          ? right
          : straight
      ;
    race = raceInputSetter(race, { engineOn, turnDirection });


    race = evalRace(carEnv)(race, dt);
    time += dt;
    history.push(race);
  }

  const posHistory = history.map((x) => x.cars.carState.pos);

  const json = JSON.stringify(history.slice(0, 20).map((x) => x.cars.carState));


  return { race, history, dt };
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
    const { simParams: { dt } } = this;
    
    let time = 0;
    (time < maxTime && race.cars.raceState === ERaceCarRaceState.racing){
      time += dt;
    }
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
        (nnResult[1])
          ? nnResult[2] ?
            straight
            : left
          : nnResult[1]
            ? right
            : straight
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

