import { range, zip } from './../core/common';
import { IBreedFunction, IAProcessGenerationFunction, IASelectionFunctionType } from './../core/ga/gaProcesGenerationFunction';
import { IAGAEvaluator } from './../core/ga/ga';
import Jest from 'jest';

import { IANNData } from '../core/nn/nn';
import { IANNInitParams, NeuralNet } from '../core/nn/nn';
import { GeneticAlgorithm } from '../core/ga/ga';
import { number } from 'prop-types';
import * as math from 'mathjs';

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
    input: trainingSet[0][0].length,
    hiddens: hiddenLayers,
    output: trainingSet[0][1].length,
  };

  const nnParams: IANNInitParams = {
    layerScheme: layers,
  };

  const init = () => NeuralNet.nnCreate(nnParams);
  const environment = (nnData: IANNData) => {
    const predicter = NeuralNet.nnPredicter(nnData);
    const predictedOutputs = input.map(predicter);
    const differences = zip(predictedOutputs, output)
      .map(([p, o]) => p.map((x, i) => Math.abs(x - o[i])))
      ;

    const mean = math.mean(differences.flat());

    return 1 - mean;
  };
  const breed: IBreedFunction<IANNData> = (data, mr) => {
    const { afunction, values: { biases, weights } } = data[0];

    const modif = (x: number) => Math.random() <= mr ? x + Math.random() - 0.5 : x;
    const modifArr = (x: number[]) => x.map(xx => modif(xx));
    const modifArrArr = (x: number[][]) => x.map(xx => modifArr(xx));

    return {
      afunction,
      values: {
        biases: biases.map(modifArr),
        weights: weights.map(modifArrArr),
      }
    }
  };


  let gaData = GeneticAlgorithm.gaCreateData<IANNData>({
    popSize,
    _function: {
      init,
      environment,
    }
  });

  const evaluator = GeneticAlgorithm.createGAEvaluator({
    gaProcessFunction,
    _function: {
      breed, environment
    },
  });

  const compareResults = (res: number[][]) => {
    return zip(res, output)
      .map(([a, b]) =>
        zip(a, b).map(([x, y]) => x === y)
          .reduce((x, y) => x && y, true))
      .reduce((x, y) => x && y, true)
  };

  const evalBest = () => {
    const bestDna = gaData[0].dna;
    const predicter = NeuralNet.nnPredicter(bestDna);
    const bestDnaResults = input
      .map(predicter)
      ;
    const resultsRounded = bestDnaResults
      .map(x => x.map(Math.round))
      ;
    return resultsRounded;
  };

  console.time("measure finding simple binary funciton")

  for (let i = 0; i < numberOfGenerations; i++) {
    gaData = evaluator(gaData);
    if (compareResults(evalBest()))
      break;
  }

  console.timeEnd("measure finding simple binary funciton")

  const resultRounded = evalBest();
  expect(resultRounded).toEqual(output);
};

describe("gann", () => {
  it("should learn simple binary function",
    _TestGANN);
});