import createExecutableFnc from './gaProcesGenerationFunction';
import { IAProcessGenerationFunction, IBreedFunction } from './gaProcesGenerationFunction';
import { range } from './../common';
import { type } from "os";

/** function for create initial population */
export type IInitDNA<DNA> = () => DNA;
/** simulation environment returns fitness */
export type IEnvironment<DNA> = (dna: DNA) => number;

/** population sorted by fittest */
export type IAGADataPopulation<DNA> = {
  fitness: number,
  dna: DNA,
}[];

export type IAGAData<DNA> = {
  /** counter of generation */
  generation: number,
  /** current population sorted by fittest */
  population: IAGADataPopulation<DNA>,
};

export type IAGAInitArgs<DNA> = {
  /** size of population */
  popSize: number,
  /** non-serializable external functions */
  _function: {
    init: IInitDNA<DNA>,
    environment: IEnvironment<DNA>,
  },
};

export type IAGAEvaluator<DNA> = {
  /** functions for select and modify population */
  gaProcessFunction: IAProcessGenerationFunction,
  /** non-serializable external functions */
  _function: {
    environment: IEnvironment<DNA>,
    breed: IBreedFunction<DNA>,
  }
}

export function sortMostFitFirst<DNA>(pop: IAGADataPopulation<DNA>) {
  const cpy = [...pop]; cpy.sort(({ fitness: a }, { fitness: b }) => -(a - b)); return cpy;
}

export abstract class GA {
  /** function for create initial random DNAs */
  public static gaCreateData<DNA>(ainitArgs: IAGAInitArgs<DNA>): IAGAData<DNA> {
    const { _function: { environment, init }, popSize } = ainitArgs;

    return {
      generation: 0,
      population:
        sortMostFitFirst(
          range(popSize)
            .map(init)
            .map(x => { return { fitness: environment(x), dna: x } })
        )
    }
  }

  /** returns function that create new population based on fitness value and selection+ */
  public static createGAEvaluator<DNA>(aevaluator: IAGAEvaluator<DNA>): ((gaData: IAGAData<DNA>) => IAGAData<DNA>) {
    const { _function: { breed, environment }, gaProcessFunction } = aevaluator;

    const createGeneration = createExecutableFnc(gaProcessFunction)(breed);

    return (gaData: IAGAData<DNA>): IAGAData<DNA> => {
      const nextGen = createGeneration(gaData.population);
      const evaledNextGen: IAGADataPopulation<DNA> = sortMostFitFirst(
        nextGen.map(x => { return { dna: x, fitness: environment(x) } })
      );

      return {
        generation: gaData.generation + 1,
        population: evaledNextGen,
      }
    }
  }
}

