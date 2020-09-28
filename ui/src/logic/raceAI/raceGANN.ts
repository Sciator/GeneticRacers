import { RaceNN, ISimParamsOptions } from "./raceNN";
import { NeuralNet } from "../ai/nn/nn";
import { IANNActivationFunction } from "../ai/nn/nnActivationFunctions";
import { Race } from "../race/race";
import { GeneticAlgorithmNeuralNet } from "../ai/gann/gann";
import { Sensors } from "./sensor";
import { Track } from "../race/track";
import { ICarPhysicsOptions } from "../race/car";
import { IAProcessGenerationFunction } from "../ai/ga/gaProcesGenerationFunction";



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
    proccessFunction: IAProcessGenerationFunction,
  },
  raceParams: {
    track: Track,
    carTemplate: {
      sensors: Sensors,
      physics?: ICarPhysicsOptions,
    }
  },
  simParams: ISimParamsOptions,


};

type IRaceGANNState = {
  gann: GeneticAlgorithmNeuralNet,
  race: Race,
  sensors: Sensors,
  simParams: ISimParamsOptions,
  proccessFunction: IAProcessGenerationFunction,
};


export class RaceGANN {
  public readonly gann: GeneticAlgorithmNeuralNet;
  public readonly race: Race;
  public readonly sensors: Sensors;
  public readonly simParams: ISimParamsOptions;
  public readonly proccessFunction: IAProcessGenerationFunction;

  public update(): RaceGANN {
    return new RaceGANN({ ...this, gann: this.gann.calculateNextGen(this.proccessFunction) });
  }

  public get racenn(): RaceNN {
    const { gann: { ga: { population: nnsfit } }, race, sensors, simParams } = this;
    const nns = nnsfit.map(x => x.dna);
    const raceNN = new RaceNN({ nns, race, sensors, simParams });
    return raceNN;
  }

  public get scores(): number[] {
    return this.gann.ga.population.map(x=>x.fitness);
  }

  public static create(init: IRaceGANNInit) {
    const { gaInit: { popSize, proccessFunction },
      nnInit: { afunction, hiddenLayers },
      raceParams: { carTemplate: { sensors, physics }, track },
      simParams,
    } = { ...init };

    const layerScheme = {
      inputs: sensors.pointsRelative.length,
      hiddens: hiddenLayers,
      outputs: 3,
    };

    const race = Race.create({ numCars: popSize, track, physics });

    const _environmentBatch = (nns: readonly NeuralNet[]) => {
      const raceNN = new RaceNN({ nns, race, sensors, simParams });
      const raceEvaled = raceNN.evalRace();
      return raceEvaled.scores;
    };

    const gann = GeneticAlgorithmNeuralNet.create({
      _environment: { _environmentBatch },
      gaInit: { popSize },
      nnInit: { layerScheme, afunction },
    });

    return new RaceGANN({
      gann,
      race,
      sensors,
      simParams,
      proccessFunction,
    });
  }

  private constructor(state: IRaceGANNState) {
    const { gann, race, sensors, simParams, proccessFunction } = state;
    this.gann = gann;
    this.race = race;
    this.sensors = sensors;
    this.simParams = simParams;
    this.proccessFunction = proccessFunction;
  }
}

