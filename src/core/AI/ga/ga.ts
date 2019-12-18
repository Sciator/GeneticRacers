import createExecutableFnc from "./gaProcesGenerationFunction";
import { IAProcessGenerationFunction, IBreedFunction } from "./gaProcesGenerationFunction";
import { range } from "../../common";

/** function for create initial population */
export type IInitDNA<DNA> = () => DNA;
/** simulation environment returns fitness */
export type IEnvironment<DNA> = (dna: DNA) => number;

export type IAGAInitArgs = {
  /** size of population */
  popSize: number,
};

/** non-serializable GA functions */
export type GAFunctions<DNA> = {
  readonly _init: IInitDNA<DNA>;
  readonly _environment: IEnvironment<DNA>;
  readonly _breed: IBreedFunction<DNA>;
};

/** population sorted by fittest */
type GAPopulation<DNA> = readonly {
  readonly fitness: number,
  readonly dna: DNA,
}[];

export class GeneticAlgorithm<DNA> {
  private readonly _functions: GAFunctions<DNA>;

  /** creates sorted copy of DNA array */
  private static sortMostFitFirst<DNA>(pop: GAPopulation<DNA>) {
    const cpy = [...pop]; cpy.sort(({ fitness: a }, { fitness: b }) => -(a - b)); return cpy;
  }

  /** population sorted by fittest */
  readonly population: GAPopulation<DNA>;

  /** returns function that create new population based on fitness value and selection+ */
  calculateNextGen(evalFunctions: IAProcessGenerationFunction) {
    const { population, _functions: { _breed, _environment } } = this;

    const createGeneration = createExecutableFnc(evalFunctions)(_breed);

    const nextGen = createGeneration(population);

    const evaledNextGen: GeneticAlgorithm<DNA> =
      new GeneticAlgorithm<DNA>(
        this._functions,
        GeneticAlgorithm.sortMostFitFirst(nextGen.map(x => { return { dna: x, fitness: _environment(x) } })
        ));

    return evaledNextGen;
  }

  /** function for create initial random DNAs */
  public static readonly create = <DNA>(fncs: GAFunctions<DNA>) => (ainitArgs: IAGAInitArgs): GeneticAlgorithm<DNA> => {
    const { popSize, _init, _environment } = { ...ainitArgs, ...fncs };

    return new GeneticAlgorithm<DNA>(
      fncs,
      GeneticAlgorithm.sortMostFitFirst(
        range(popSize)
          .map(_init)
          .map(x => { return { fitness: _environment(x), dna: x } })
      )
    )
  }

  private constructor(fncs: {
    _init: IInitDNA<DNA>,
    _environment: IEnvironment<DNA>,
    _breed: IBreedFunction<DNA>,
  }, pop: GAPopulation<DNA>
  ) {
    this._functions = fncs;
    this.population = pop;
  }
}

