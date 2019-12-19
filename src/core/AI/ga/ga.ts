import createExecutableFnc from "./gaProcesGenerationFunction";
import { IAProcessGenerationFunction, IBreedFunction } from "./gaProcesGenerationFunction";
import { range } from "../../common";

/** function for create initial population */
export type IDNAInit<DNA> = () => DNA;
/** simulation environment returns fitness */
export type IEnvironment<DNA> = (dna: DNA) => number;

export type IGAInitArgs = {
  /** size of population */
  popSize: number,
};

/** non-serializable GA functions */
export type IGAFunctions<DNA> = {
  readonly _init: IDNAInit<DNA>;
  readonly _environment: IEnvironment<DNA>;
  readonly _breed: IBreedFunction<DNA>;
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
    const { population, _functions: { _breed, _environment, }, } = this;

    const createGeneration = createExecutableFnc(evalFunctions)(_breed);

    const nextGen = createGeneration(population);

    const evaledNextGen: GeneticAlgorithm<DNA> =
      new GeneticAlgorithm<DNA>(
        this._functions,
        GeneticAlgorithm.sortMostFitFirst(nextGen.map((x) => ({ dna: x, fitness: _environment(x), }))
        ));

    return evaledNextGen;
  }

  /** function for create initial random DNAs */
  public static create<DNA>(fncs: IGAFunctions<DNA>) {
    return (ainitArgs: IGAInitArgs): GeneticAlgorithm<DNA> => {
      const { popSize, _init, _environment, } = { ...ainitArgs, ...fncs, };

      return new GeneticAlgorithm<DNA>(
        fncs,
        range(popSize)
          .map(_init)
          .map((x) => ({ fitness: _environment(x), dna: x, }))
      );
    };
  }

  /** creates sorted copy of DNA array */
  private static sortMostFitFirst<DNA>(pop: IGAPopulation<DNA>) {
    const cpy = [...pop,]; cpy.sort(({ fitness: a, }, { fitness: b, }) => -(a - b)); return cpy;
  }

  constructor(fncs: {
    _init: IDNAInit<DNA>,
    _environment: IEnvironment<DNA>,
    _breed: IBreedFunction<DNA>,
  }, pop: IGAPopulation<DNA>
  ) {
    this._functions = fncs;
    this.population = GeneticAlgorithm.sortMostFitFirst(pop);
  }
}

