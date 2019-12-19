import { NeuralNet, IANNData, IANNInitParams } from "../nn/nn";
import { GeneticAlgorithm, IGAFunctions, IEnvironment, IGAInitArgs } from "../ga/ga";
import { throwReturn } from "../../common";
import { IAProcessGenerationFunction } from "../ga/gaProcesGenerationFunction";


export type IGeneticAlgorithmNeuralNetInit =
  {
    nnInit: IANNInitParams,
    gaInit: IGAInitArgs,
    _environment: IEnvironment<NeuralNet>,
  };



export class GeneticAlgorithmNeuralNet {
  public readonly ga: GeneticAlgorithm<NeuralNet>;

  public evalByBest(inputs: number[]){
    return this.ga.population[0].dna.predict(inputs);
  }

  public calculateNextGen(evalFunctions: IAProcessGenerationFunction): GeneticAlgorithmNeuralNet {
    return new GeneticAlgorithmNeuralNet(this.ga.calculateNextGen(evalFunctions));
  }

  public static create(params: IGeneticAlgorithmNeuralNetInit) {
    const { _environment, nnInit, gaInit } = params;

    const gaFunctions: IGAFunctions<NeuralNet> = {
      _environment,
      _init: () => NeuralNet.create(nnInit),
      _breed: (dnas: NeuralNet[], mutationRate: number) =>
        dnas.length === 1
          ? dnas[0].mutate(mutationRate)
          : throwReturn("Invalid number of breeding parents, breeding is currently implemented for 1 parent!")
      ,
    };

    const ga = GeneticAlgorithm.create(gaFunctions)(gaInit);

    return new GeneticAlgorithmNeuralNet(ga);
  }

  private constructor(ga: GeneticAlgorithm<NeuralNet>) {
    this.ga = ga;
  }
}

