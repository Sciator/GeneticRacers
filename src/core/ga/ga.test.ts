import { range } from './../common';
import { GeneticAlgorithm, IAGAInitArgs, IAGAEvaluator } from './ga';
import jest from 'jest';
import * as math from 'mathjs';
import { IASelectionFunctionType } from './gaProcesGenerationFunction';

const alpha = "abcdefghijklmnopqrstuvwxyz ";

const getRandomChar = () => alpha[math.randomInt(0, alpha.length)];


describe("Genetic algorithm", () => {
  it("should find simple text", () => {
    const text = "simple text blah blah";

    const textL = text.length;
    const _initFnc = () => range(textL).map(getRandomChar).join('');

    const _env = (w: string) =>
      math.mean(range(textL).map(x => text[x] === w[x]).map(x => x ? 1 : 0));

    const _breed = (w: string[], mr: number) => {
      const [f] = w;
      return f.split('').map(x=> mr >= Math.random() ? getRandomChar() : x).join('');
    };


    const gaInit: IAGAInitArgs<string> = {
      popSize: 100,

      _function: {
        init: _initFnc,
        environment: _env,
      }
    };

    const gaEvaluator: IAGAEvaluator<string> = {
      gaProcessFunction: {
        selection:{
          type: IASelectionFunctionType.percent,
          value: 10,
        },
        mutationRate: .1,
        breedingParents: 1,
        canBreedSelf: true,
      },
      _function: {
        environment: _env,
        breed: _breed,
      }
    };

    let gaData = GeneticAlgorithm.gaCreateData(gaInit);

    const evaluator = GeneticAlgorithm.createGAEvaluator(gaEvaluator);

    range(100).forEach(() => {
      gaData = evaluator(gaData);
    })

    expect(gaData[0].dna).toBe(text);
  });

  //todo: breed multiple together test
});
