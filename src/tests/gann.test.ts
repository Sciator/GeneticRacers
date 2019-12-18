import Jest from "jest";
import { range, zip } from "./../core/common";
import { IBreedFunction, IAProcessGenerationFunction, IASelectionFunctionType } from "../core/AI/ga/gaProcesGenerationFunction";
import * as math from "mathjs";
import { GeneticAlgorithm } from "../core/AI/ga/ga";
import { IANNInitParams, NeuralNet, IANNData } from "../core/AI/nn/nn";

// todo: vytvořit GANN přímo
export const _TestGANN = () => {
  const trainingSet = [
    [[0, 0], [0]],
    [[1, 0], [1]],
    [[0, 1], [1]],
    [[1, 1], [0]],
  ] as [number[], number[]][];
  const hiddenLayers: number[] = [5,5];
  const numberOfGenerations: number = 200;

  const popSize = 100;
  const gaProcessFunction: IAProcessGenerationFunction = {
    breedingParents: 1,
    mutationRate: .8,
    selection: {
      type: IASelectionFunctionType.fixed,
      value: 10,
    }
  };

  const input = trainingSet.map(([input, output]) => input);
  const output = trainingSet.map(([input, output]) => output);

  const layers = {
    inputs: trainingSet[0][0].length,
    hiddens: hiddenLayers,
    outputs: trainingSet[0][1].length,
  };

  const nnParams: IANNInitParams = {
    layerScheme: layers,
  };

  const _init = () => NeuralNet.create(nnParams);
  
  const _environment = (nnData: IANNData) => {
    const nn = new NeuralNet(nnData);
    const predictedOutputs = input.map(nn.predict);
    const differences = zip(predictedOutputs, output)
      .map(([p, o]) => p.map((x, i) => Math.abs(x - o[i])))
      ;

    const mean = math.mean(differences.flat());

    return 1 - mean;
  };
  const _breed: IBreedFunction<IANNData> = (data, mr) => {
    const { functions, values: { biases, weights } } = data[0];

    const modif = (x: number) => Math.random() <= mr ? x + Math.random() - 0.5 : x;
    const modifArr = (x: number[]) => x.map(xx => modif(xx));
    const modifArrArr = (x: number[][]) => x.map(xx => modifArr(xx));

    return {
      functions,
      values: {
        biases: biases.map(modifArr),
        weights: weights.map(modifArrArr),
      }
    }
  };


  let ga = GeneticAlgorithm.create({_breed,_environment,_init})({popSize});
  
  const compareResults = (res: number[][]) => {
    return zip(res, output)
      .map(([a, b]) =>
        zip(a, b).map(([x, y]) => x === y)
          .reduce((x, y) => x && y, true))
      .reduce((x, y) => x && y, true)
  };

  const evalBest = () => {
    const bestDna = ga.population[0].dna;
    const nn = new NeuralNet(bestDna);
    const bestDnaResults = input
      .map(nn.predict)
      ;
    const resultsRounded = bestDnaResults
      .map(x => x.map(Math.round))
      ;
    return resultsRounded;
  };

  console.time("measure finding simple binary funciton")
  
  let i = 0
  for (; i < numberOfGenerations; i++) {
    ga = ga.calculateNextGen(gaProcessFunction);
    if (compareResults(evalBest()))
      break;
  }

  console.timeEnd("measure finding simple binary funciton")

  const resultRounded = evalBest();
  expect(resultRounded).toEqual(output);
  console.log(`generation ${i}`);
};

describe("gann", () => {
  it("should learn simple binary function",
    _TestGANN);
});