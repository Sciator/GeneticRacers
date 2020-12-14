import { zip, range } from "../../../core/common";
import createExecutableFnc from "./gaProcesGenerationFunction";
import { IAProcessGenerationFunction, IBreedFunction } from "./gaProcesGenerationFunction";

/** function for create initial population */
export type IDNAInit<DNA> = () => DNA;
export type IGAInitArgs = {
  /** size of population */
  popSize: number,
};

export type EnvironmentFunctions<DNA> = ({
  /** simulation environment returns fitness */
  _environment: (dna: DNA) => number;
} | {
  /** simulation environment returns fitness for whole population at once */
  _environmentBatch: (dna: DNA[]) => number[],
});

/** non-serializable GA functions */
export type IGAFunctionsInit<DNA> = {
  _init: IDNAInit<DNA>,
  _breed: IBreedFunction<DNA>,
} & EnvironmentFunctions<DNA>;

/** non-serializable GA functions */
type IGAFunctions<DNA> = {
  _init: IDNAInit<DNA>,
  _breed: IBreedFunction<DNA>,
  _environmentBatch: (dna: DNA[]) => number[],
};

/** population sorted by fittest */
type IGAPopulation<DNA> = readonly {
  readonly fitness: number,
  readonly dna: DNA,
}[];

export class GeneticAlgorithm<DNA> {
  /** non-serializable GA functions */
  private readonly _functions: IGAFunctions<DNA>;

  /** population sorted by fittest */
  public readonly population: IGAPopulation<DNA>;


  /** returns function that create new population based on fitness value and selection+ */
  public calculateNextGen(evalFunctions: IAProcessGenerationFunction) {
    const { population, _functions: { _breed, _environmentBatch, }, } = this;

    const createGeneration = createExecutableFnc(evalFunctions)(_breed);

    const nextGen = createGeneration(population);

    const fitnesses = _environmentBatch(nextGen);

    const evaledNextGen: GeneticAlgorithm<DNA> =
      new GeneticAlgorithm<DNA>(
        this._functions,
        GeneticAlgorithm.sortMostFitFirst(
          zip(nextGen, fitnesses)
            .map(([dna, fitness]) => ({ fitness, dna }))
        )
      );

    return evaledNextGen;
  }

  /** function for create initial random DNAs */
  public static create<DNA>(fncs: IGAFunctionsInit<DNA>) {
    return (ainitArgs: IGAInitArgs): GeneticAlgorithm<DNA> => {
      const { popSize, _init, } = { ...ainitArgs, ...fncs, };

      const _environmentBatch =
        ("_environment" in fncs)
          ? (dnas: DNA[]) => dnas.map(x => fncs._environment(x))
          : fncs._environmentBatch
        ;

      const pop = range(popSize)
        .map(_init);

      const fitnesses =
        _environmentBatch(pop);

      return new GeneticAlgorithm<DNA>(
        { _breed: fncs._breed, _init: fncs._init, _environmentBatch },
        zip(pop, fitnesses)
          .map(([dna, fitness]) => ({ fitness, dna }))
      );
    };
  }

  /** creates sorted copy of DNA array */
  private static sortMostFitFirst<DNA>(pop: IGAPopulation<DNA>) {
    return [...pop,].sort(({ fitness: a, }, { fitness: b, }) => -(a - b));
  }

  private constructor(fncs: IGAFunctions<DNA>, pop: IGAPopulation<DNA>
  ) {
    this._functions = fncs;
    this.population = GeneticAlgorithm.sortMostFitFirst(pop);
  }
}

