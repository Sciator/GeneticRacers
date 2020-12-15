import { NeuralNet, IANNInitParams } from "../nn/nn";
import { GeneticAlgorithm, IGAInitArgs, EnvironmentFunctions, IGAFunctionsInit } from "../ga/ga";
import { IAProcessGenerationFunction } from "../ga/gaProcesGenerationFunction";
import { throwReturn } from "../../../core/common";


export type IGeneticAlgorithmNeuralNetInit =
  {
    nnInit: IANNInitParams,
    gaInit: IGAInitArgs,
    _environment: EnvironmentFunctions<NeuralNet>,
  };



export class GeneticAlgorithmNeuralNet {
  public readonly ga: GeneticAlgorithm<NeuralNet>;

  public calculateNextGen(evalFunctions: IAProcessGenerationFunction): GeneticAlgorithmNeuralNet {
    return new GeneticAlgorithmNeuralNet(this.ga.calculateNextGen(evalFunctions));
  }

  public static create(params: IGeneticAlgorithmNeuralNetInit) {
    const { nnInit, gaInit, _environment } = params;

    const gaFunctions: IGAFunctionsInit<NeuralNet> = {
      ..._environment,
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

