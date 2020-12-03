import * as math from "mathjs";
import { range } from "../../../core/common";

type GAPopulation<DNA> = readonly {
  readonly fitness: number,
  readonly dna: DNA,
}[];

export type IBreedFunction<DNA> = (dna: DNA[], mutationRate: number) => DNA;

export type IAProcessGenerationFunction = {
  selection: IASelectionFunction,
  mutationRate: number,
  breedingParents: 1,
};

export enum IASelectionFunctionType { percent, fixed, weighted }
export type IASelectionFunction = {
  type: IASelectionFunctionType.weighted,
} | {
  type: IASelectionFunctionType,
  value: number,
};

type ISelectionFunction<DNA> = (pop: GAPopulation<DNA>) => DNA[];
/** create function for selecting most fittest dna */
export const createExecutableFncSelection = <DNA>(aargs: IASelectionFunction): ISelectionFunction<DNA> => {

  switch (aargs.type) {
    case IASelectionFunctionType.fixed:
      return (pop: GAPopulation<DNA>) => pop.slice(0, aargs.value).map((x) => x.dna);
    case IASelectionFunctionType.percent:
      return (pop: GAPopulation<DNA>) => {
        const val = Math.floor(pop.length * aargs.value / 100) || 1;
        return pop.slice(0, val).map((x) => x.dna);
      };

    default: throw new Error("invalid type");
  }
};

const createExecutableFnc = (aFnc: IAProcessGenerationFunction) => {
  const { breedingParents, selection, } = aFnc;
  return <DNA>(breedFnc: IBreedFunction<DNA>) => {
    return (pop: GAPopulation<DNA>) => {
      const popLen = pop.length;
      if (selection.type === IASelectionFunctionType.weighted) {
        return range(popLen).map(() => {
          const selectedIndex: number[] =
            math.pickRandom(range(pop.length), breedingParents, pop.map(x => (x.fitness*100)**2)) as any;
          const selected = selectedIndex.map(x => pop[x].dna);

          return breedFnc(selected, aFnc.mutationRate);
        });

      } else {

        const selectionFunction = createExecutableFncSelection<DNA>(selection);
        const preparedForBreeding = selectionFunction(pop);

        return range(popLen).map(() => {
          const selected =
            range(breedingParents)
              .map(() => math.randomInt(0, preparedForBreeding.length))
              .map((x) => preparedForBreeding[x])
            ;

          return breedFnc(selected, aFnc.mutationRate);
        });
      }

    };
  };
};

export default createExecutableFnc;
