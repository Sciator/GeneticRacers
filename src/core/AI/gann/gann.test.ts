// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Jest from "jest";
import * as math from "mathjs";
import { IAProcessGenerationFunction, IASelectionFunctionType } from "../ga/gaProcesGenerationFunction";
import { IANNInitParams, NeuralNet } from "../nn/nn";
import { GeneticAlgorithmNeuralNet } from "./gann";
import { IEnvironment, IGAInitArgs } from "../ga/ga";
import { zip } from "../../common";

describe("gann", () => {
  it("should learn simple binary function",
    () => {
      const trainingSet = [
        [[0, 0], [0]],
        [[1, 0], [1]],
        [[0, 1], [1]],
        [[1, 1], [0]],
      ] as [number[], number[]][];
      const hiddenLayers: number[] = [5, 10, 5];
      const numberOfGenerations: number = 200;


      const gaInit: IGAInitArgs = {
        popSize: 100,
      };

      const nnInit: IANNInitParams = {
        layerScheme: {
          inputs: trainingSet[0][0].length,
          hiddens: hiddenLayers,
          outputs: trainingSet[0][1].length,
        },
      };

      const input = trainingSet.map(([i, o]) => i);
      const output = trainingSet.map(([i, o]) => o);

      const _environment: IEnvironment<NeuralNet> = (nn: NeuralNet) => {
        const predictedOutputs = input.map((x) => nn.predict(x));
        const differences = zip(predictedOutputs, output)
          .map(([p, o]) => p.map((x, i) => Math.abs(x - o[i])))
          ;

        const mean = math.mean(differences.flat());

        return 1 - mean;
      };

      let gann = GeneticAlgorithmNeuralNet.create({ _environment, gaInit, nnInit });


      const gaProcessFunction: IAProcessGenerationFunction = {
        breedingParents: 1,
        mutationRate: 1,
        selection: {
          type: IASelectionFunctionType.fixed,
          value: 10,
        },
      };



      const compareResults = (res: number[][]) =>
        zip(res, output)
          .map(([a, b]) =>
            zip(a, b).map(([x, y]) => x === y)
              .reduce((x, y) => x && y, true))
          .reduce((x, y) => x && y, true);


      const evalBest = () => {
        const bestDnaResults = input
          .map((x) => gann.evalByBest(x))
          ;
        const resultsRounded = bestDnaResults
          .map((x) => x.map(Math.round))
          ;
        return resultsRounded;
      };

      console.time("measure finding simple binary funciton");

      let generationNum = 0;
      for (; generationNum < numberOfGenerations; generationNum++) {
        gann = gann.calculateNextGen(gaProcessFunction);
        if (compareResults(evalBest()))
          break;
      }

      console.timeEnd("measure finding simple binary funciton");

      const resultRounded = evalBest();
      expect(resultRounded).toEqual(output);
      console.log(`generation ${generationNum}`);
    });
});
