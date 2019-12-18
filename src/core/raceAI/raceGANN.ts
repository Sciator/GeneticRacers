import { IRaceNNArg, createRaceNN, evalRaceNN } from "./raceNN";
import { IANNData } from "../AI/nn/nn";
import { GeneticAlgorithm } from "../AI/ga/ga";
import { IANNActivationFunction } from "../AI/nn/nnActivationFunctions";
import { raceGetCurrentScore } from "../race/race";
import { IASelectionFunctionType } from "../AI/ga/gaProcesGenerationFunction";


export type IRaceGANNInit = {
  nnInit: {
    hiddenLayers: number[],
    afunction?: {
      hidden: IANNActivationFunction,
      output: IANNActivationFunction,
    },
  },

  popSize: number,

  raceNN: IRaceNNArg,
};

export const initRaceGANN = (args: IRaceGANNInit): IRaceGANNData => {
  const { popSize, nnInit: { hiddenLayers }, raceNN } = args;
  const numSensors = raceNN.sensors.length;

  const init = () => createRaceNN({ nnInit: { hiddenLayers }, numSensors });

  const environment = (nn: IANNData) => {
    const raceRes = evalRaceNN({
      ...raceNN,
      nn,
    });
    return raceGetCurrentScore({ car: raceRes.race.car, track: raceNN.track });
  };

  const gaData = GeneticAlgorithm.gaCreateData({ _function: { environment, init }, popSize });

  return {
    raceNN,
    pop: gaData,
  };
};


export type IRaceGANNData = {
  pop: IAGADataPopulation<IANNData>,
  raceNN: IRaceNNArg,
};


export const evalRaceGANN = (data: IRaceGANNData): IRaceGANNData => {
  const { pop, raceNN } = data;

  const environment = (nn: IANNData) => {
    const raceRes = evalRaceNN({
      ...raceNN,
      nn,
    });
    return raceGetCurrentScore({ car: raceRes.race.car, track: raceNN.track });
  };

  const breed = ([nn]: IANNData[], mr: number) => {
    const { functions, values: { biases, weights } } = nn;

    const modif = (x: number) => Math.random() <= mr ? x + Math.random() - 0.5 : x;
    const modifArr = (x: number[]) => x.map(modif);
    const modifArrArr = (x: number[][]) => x.map(modifArr);

    return {
      functions,
      values: {
        biases: biases.map(modifArr),
        weights: weights.map(modifArrArr),
      },
    };
  };

  const gaEvaluator: GAEvaluator<IANNData> = {
    gaProcessFunction: {
      selection: {
        type: IASelectionFunctionType.percent,
        value: 10,
      },
      mutationRate: .1,
      breedingParents: 1,
    },
    _function: {
      environment,
      breed,
    },
  };

  const evaluator = GeneticAlgorithm(gaEvaluator);

  const evaledData = evaluator(pop);

  return {
    raceNN: data.raceNN,
    pop: evaledData,
  };
};


export const raceGANNGetHist = (data: IRaceGANNData) => {
  const { pop, raceNN } = data;

  return pop.map(x => {
    const raceRes = evalRaceNN({
      ...raceNN,
      nn: x.dna,
    });
    return raceRes;
  });
};
