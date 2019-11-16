import { range } from './../core/common';
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
    [[1, 0], [0, 1]],
    [[0, 1], [1, 0]],
  ] as [number[], number[]][];
  const hiddenLayers = [5];

  const gaProcessFunction: IAProcessGenerationFunction = {
    breedingParents: 1,
    mutationRate: .1,
    selection: {
      type: IASelectionFunctionType.percent,
      value: 10,
    }
  };

  const layers = { input: trainingSet[0][0].length, hiddens: hiddenLayers, output: trainingSet[0][1].length, };

  const nnParams: IANNInitParams = {
    layerScheme: layers,
  };

  const init = () => NeuralNet.nnCreate(nnParams);
  const environment = (nnData: IANNData) => {
    const predicter = NeuralNet.nnPredicter(nnData);

    return 1 - math.mean(trainingSet.map(([input, output]) =>
      predicter(input)
        .map((x, i) => Math.abs(x - output[i]))
        .reduce((a, b) => a + b, 0)
    ).reduce((a, b) => a + b, 0));
  };
  const breed: IBreedFunction<IANNData> = (data, mr) => {
    const { afunction, values: { biases, weights } } = data[0];

    const modif = (x: number) => x + math.random(-mr, mr);
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
    popSize: 100,
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

  range(100).forEach(() => {
    gaData = evaluator(gaData);
  });

  const bestDna = gaData.population[0].dna;
  const predicter = NeuralNet.nnPredicter(bestDna);
  const bestDnaResults = trainingSet.map(([input, _]) => predicter(input));

  // expect(bestDnaResults).toEqual();
  throw new Error("");
};

/*
describe("gann", () => {
  it("should learn simple binary function",
    _TestGANN);
});
*/