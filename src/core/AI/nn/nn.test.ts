import { random } from 'mathjs';
import Jest from 'jest';

import { range } from '../../common';
import { NeuralNet, IANNInitParams } from './nn';


describe("neural net", () => {
  it("should not crash", () => {
    range(10).slice(1).forEach(x => {
      range(100).slice(1).forEach(y => {
        const nnparamsTsst: IANNInitParams = {
          layerScheme: { inputs: y, hiddens: [20], outputs: y, },
        }

        const nn = NeuralNet.nnCreate(nnparamsTsst);
        const predict = NeuralNet.nnPredicter(nn);
        const a = predict(range(y).map(() => random(-1, 1)));
      })
    })

  })
})

