// eslint-disable-next-line @typescript-eslint/no-unused-vars
import jest from "jest";
import { GeneticAlgorithm } from "./ga";
import * as math from "mathjs";
import { IASelectionFunctionType, IAProcessGenerationFunction } from "./gaProcesGenerationFunction";
import { range } from "../../../../core/common";

const alpha = "abcdefghijklmnopqrstuvwxyz ";

const getRandomChar = () => alpha[math.randomInt(0, alpha.length)];


describe("Genetic algorithm", () => {
  it("should find simple text", () => {
    const text = "simple text blah blah";

    const textL = text.length;
    const _init = () => range(textL).map(getRandomChar).join("");

    const _environment = (w: string) =>
      math.mean(range(textL).map((x) => text[x] === w[x]).map((x) => x ? 1 : 0));

    const _breed = (w: string[], mr: number) => {
      const [f,] = w;
      return f.split("").map((x) => mr >= Math.random() ? getRandomChar() : x).join("");
    };

    const popSize = 100;

    const gaProcessFunction: IAProcessGenerationFunction = {
      selection: {
        type: IASelectionFunctionType.percent,
        value: 10,
      },
      mutationRate: .1,
      breedingParents: 1,
    };

    let ga = GeneticAlgorithm.create({ _breed, _environment, _init, })({ popSize, });

    range(200).forEach(() => {
      ga = ga.calculateNextGen(gaProcessFunction);
    });

    expect(ga.population[0].dna).toBe(text);
  });

  // todo: breed multiple together test
});
