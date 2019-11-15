import { range } from './../common';
import { IAGAData, IAGADataPopulation } from './ga';
import * as math from 'mathjs';

export type IBreedFunction<DNA> = (dna: DNA[], mutationRate: number) => DNA;

export type IAProcessGenerationFunction = {
  selection: IASelectionFunction,
  mutationRate: number,
} & ({
  breedingParents: 1,
  canBreedSelf?: false,
} | {
  breedingParents: number,
  canBreedSelf?: boolean,
})
  ;

export enum IASelectionFunctionType { "percent", "fixed" } //, "differenceFromBest" ?
export type IASelectionFunction = {
  type: IASelectionFunctionType,
  value: number,
};

type ISelectionFunction<DNA> = (pop: IAGADataPopulation<DNA>) => DNA[];
/** create function for selecting most fittest dna */
export function createExecutableFncSelection<DNA>(aargs: IASelectionFunction): ISelectionFunction<DNA> {

  switch (aargs.type) {
    case IASelectionFunctionType.fixed:
      return (pop: IAGADataPopulation<DNA>) => pop.slice(0, aargs.value).map(x => x.dna);
    case IASelectionFunctionType.percent:
      return (pop: IAGADataPopulation<DNA>) => {
        const val = Math.floor(pop.length * aargs.value / 100);
        return pop.slice(0, val).map(x => x.dna)
      };

    default: throw new Error("invalid type");
  }
};



const createExecutableFnc = (aFnc: IAProcessGenerationFunction) => {
  const { breedingParents, selection } = aFnc;
  const canBreedSelf = aFnc.canBreedSelf || false;

  return <DNA>(breedFnc: IBreedFunction<DNA>) => {

    return (pop: IAGADataPopulation<DNA>) => {
      const popLen = pop.length;
      const selectionFunction = createExecutableFncSelection<DNA>(selection);
      const preparedForBreeding = selectionFunction(pop);

      return range(popLen).map(() => {
        const selected =
          (canBreedSelf
            ? range(breedingParents).map(() => math.pickRandom(range(breedingParents)) as number)
            : math.pickRandom(range(breedingParents), breedingParents) as number[])
            .map(x => preparedForBreeding[x])
          ;

        return breedFnc(selected, aFnc.mutationRate);
      });

    }
  }
}


export default createExecutableFnc;
