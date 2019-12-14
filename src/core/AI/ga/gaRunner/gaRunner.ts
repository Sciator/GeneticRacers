import { IAProcessGenerationFunction, IBreedFunction } from "../gaProcesGenerationFunction";
import { IInitDNA, IEnvironment, IAGADataPopulation, GeneticAlgorithm } from "../ga";


export type IAGAExternalFunctions<DNA> = {
  init: IInitDNA<DNA>,
  environment: IEnvironment<DNA>,
  breed: IBreedFunction<DNA>,
};

export type IAGARunner<DNA> = {
  /** size of population */
  popSize: number,
  /** functions for select and modify population */
  gaProcessFunction: IAProcessGenerationFunction,
  /** non-serializable external functions */
  _functions: IAGAExternalFunctions<DNA>,
};

export type IMGARunner<DNA> = {
  popSize: number,
  generations: IAGADataPopulation<DNA>[],
  gaProcessFunction: IAProcessGenerationFunction,
};

export class GARunner<DNA> {
  public data: IMGARunner<DNA>;
  public _functions: IAGAExternalFunctions<DNA>;

  public get fitnessValues() {
    return this.data.generations.map(x => Math.max(...x.map(y => y.fitness)))
  }

  public get currentGenerationFitness() {
    return this.fitnessValues[this.fitnessValues.length - 1] || 0;
  }

  public get lastGeneration() {
    const { generations } = this.data;
    return generations[generations.length - 1] || null;
  }

  public calculateNextGeneration() {
    const { breed, environment, init } = this._functions;
    const { gaProcessFunction, generations } = this.data;
    if (generations.length === 0) {
      const population = GeneticAlgorithm.gaCreateData({ _function: { environment, init }, popSize: this.data.popSize });
      generations.push(population);
    } else {
      const evaluator = GeneticAlgorithm.createGAEvaluator({ gaProcessFunction, _function: { breed, environment } })
      const population = evaluator(this.lastGeneration)
      generations.push(population);
    }
  }

  constructor(args: IAGARunner<DNA>) {
    const { _functions, popSize, gaProcessFunction } = args;
    this._functions = _functions;

    this.data = { gaProcessFunction, popSize, generations: [] }
  }
}

