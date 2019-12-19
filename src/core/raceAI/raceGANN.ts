import { IRaceNNArg, createRaceNN, evalRaceNN } from "./raceNN";
import { IANNData, NeuralNet } from "../AI/nn/nn";
import { GeneticAlgorithm, IGAInitArgs } from "../AI/ga/ga";
import { IANNActivationFunction } from "../AI/nn/nnActivationFunctions";
import { Race } from "../race/race";
import { IASelectionFunctionType } from "../AI/ga/gaProcesGenerationFunction";
import { GeneticAlgorithmNeuralNet } from "../AI/gann/gann";
import { Sensors } from "./sensor";
import { Track } from "../race/track";
import { ICarPhysicsOptions } from "../race/car";




export const initRaceGANN = (args: IRaceGANNInit): IRaceGANNData => {
  const { popSize, nnInit: { hiddenLayers }, raceNN } = args;
  const numSensors = raceNN.sensors.length;

  const init = () => createRaceNN({ nnInit: { hiddenLayers }, numSensors });

  const environment = (nn: IANNData) => {
    const raceRes = evalRaceNN({
      ...raceNN,
      nn,
    });
    return raceGetCurrentScore({ car: raceRes.race.cars, track: raceNN.track });
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
    return raceGetCurrentScore({ car: raceRes.race.cars, track: raceNN.track });
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


export type IRaceGANNInit = {
  nnInit: {
    hiddenLayers: number[],
    afunction?: {
      hidden: IANNActivationFunction,
      output: IANNActivationFunction,
    },
  },
  gaInit: {
    popSize: number,
  },
  race: {
    track: Track,
    carTemplate: {
      sensors: Sensors[],
      carPhysics?: ICarPhysicsOptions,
    }
  }
};

type IRaceGANNState = {
  gann: GeneticAlgorithmNeuralNet,
  race: Race,
  sensors: readonly Sensors[],
}


export class RaceGANN {
  public readonly gann: GeneticAlgorithmNeuralNet;
  public readonly race: Race;
  public readonly sensors: readonly Sensors[];


  public create(init: IRaceGANNInit) {
    const { gaInit: { popSize },
      nnInit: { afunction, hiddenLayers },
      race: { carTemplate: { sensors, carPhysics }, track },
    } = { ...init };

    const _environment = (nn: NeuralNet) => {
      const { race:{cars,track,setInputs}, sensors } = this;
      
      setInputs()
    };

    const layerScheme = {
      inputs: sensors.length,
      hiddens: hiddenLayers,
      outputs: 3,
    }

    const gann = GeneticAlgorithmNeuralNet.create({
      _environment,
      gaInit: { popSize },
      nnInit: { layerScheme, afunction }
    });

    return new RaceGANN({
      gann,
      race,
      sensors
    })

  }

  private constructor(state: IRaceGANNState) {
    const { gann, race, sensors } = state;
    this.gann = gann;
    this.race = race;
    this.sensors = sensors;
  }
}



