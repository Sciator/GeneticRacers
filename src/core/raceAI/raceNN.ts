import { Track } from "../race/track"
import { Point } from "../types"
import { IANNActivationFunction } from "../AI/nn/nnActivationFunctions"
import { IRaceCarState, raceInit, ERaceCarRaceState, evalRace, raceInputSetter, IRaceState } from "../race/race"
import { NeuralNet, IANNData } from "../AI/nn/nn"
import { calculateSensorDetection } from "./sensor"
import { createCarEnvironment, ICarPhysicsOptions, ETurnDirection } from "../race/car"

export const raceNNDefaults = {
  /** delta time in seconds */
  dt: .05,
  maxTime: 10,
}

export type IRaceNNArg = {
  track: Track,
  sensors: Point[],
  nn: IANNData,
  dt?: number,
  maxTime?: number,
  carPhysics?: ICarPhysicsOptions,
}

export type IRaceNNRes = {
  track: Track,
  car: IRaceCarState,
}


export type ICreateRaceNeuralNet = {
  numSensors: number,
  nnInit: {
    hiddenLayers: number[],
    afunction?: {
      hidden: IANNActivationFunction,
      output: IANNActivationFunction,
    },
  },
}

export const createRaceNN = (args: ICreateRaceNeuralNet) => {
  const { numSensors: inputs, nnInit: { afunction, hiddenLayers: hiddens } } = args;
  return NeuralNet.nnCreate({
    layerScheme: {
      inputs,
      hiddens,
      outputs: 3,
    },
    afunction,
  })
}

export type IRaceNNHist = {
  race: IRaceState, history: IRaceState[], dt: number
}

export const evalRaceNN = (args: IRaceNNArg): IRaceNNHist => {
  const { dt, maxTime, nn: nnParams, sensors, track, carPhysics } = { ...raceNNDefaults, ...args, carPhysics:{acceleration: 300} };

  const nn = NeuralNet.nnPredicter(nnParams);
  const evalSensor = calculateSensorDetection(track)(sensors);
  const carEnv = createCarEnvironment(carPhysics);

  let race = raceInit({ track });
  let time = 0;

  const history = [race];

  while (time < maxTime && race.car.raceState === ERaceCarRaceState.racing) {
    const sensorStateMapped = evalSensor(race.car.carState).map(x => x.nearestMapped);
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

  const posHistory = history.map(x=>x.car.carState.pos);

  const json = JSON.stringify(history.slice(0,20).map(x=>x.car.carState))


  return { race, history, dt };
};


