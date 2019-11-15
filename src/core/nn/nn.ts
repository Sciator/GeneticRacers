import { IANNActivationFunction, IANNActivationFunctionType, createExecutableFnc } from './nnActivationFunctions';
import * as math from 'mathjs';
import { random } from 'mathjs';
import { range } from '../common';

/** layer scheme for creating new nn */
export type IANNInitParams = {
  layerScheme: {
    input: number,
    hiddens: number[],
    output: number
  },
  afunction?: {
    hidden: IANNActivationFunction,
    output: IANNActivationFunction,
  }
};

/** values of nn */
export type IANNDataValues = {
  weights: number[][][],
  biases: number[][],
}

/** full nn with activation afunction */
export type IANNData = {
  values: IANNDataValues,
  afunction: {
    hidden: IANNActivationFunction,
    output: IANNActivationFunction,
  }
}
// in -> *weights -> +bias -> hidd-fnc -> ...


export abstract class NeuralNet {
  /** initialize new nn with given layer schema (and random values) */
  public static nnCreate(nnInitParams: IANNInitParams): IANNData {
    const out = {
      values: { biases: [], weights: [] },
      afunction: {
        hidden: { type: IANNActivationFunctionType.tanh },
        output: { type: IANNActivationFunctionType.sigmoid },
      }
    } as IANNData;

    if (nnInitParams.afunction) {
      out.afunction = nnInitParams.afunction;
    }

    const { hiddens, input, output } = nnInitParams.layerScheme;

    // create tupples (input, hidden0) (hidden0, hidden1) ... (hiddenn, output)
    const tuples = [[input, hiddens[0]]] as [number, number][];
    [...hiddens, output].slice(1).forEach(x => tuples.push([tuples[tuples.length - 1][1], x]))

    out.values.weights = tuples.map(([l1, l2]) =>
      range(l1).map(() => range(l2).map(() => random(-1, 1))));

    out.values.biases = [...hiddens, output].map(x => range(x).map(() => random(-1, 1)));

    return out;
  }

  /** creates predict function for given nn */
  public static nnPredicter(nndata: IANNData): (x: number[]) => number[] {
    const hidden = createExecutableFnc(nndata.afunction.hidden);
    const output = createExecutableFnc(nndata.afunction.output);

    return (input: number[]) => {
      let current = [input];
      const { biases, weights } = nndata.values;

      range(biases.length).forEach(i => {
        current = math.multiply(current, weights[i]) as number[][];
        current = math.add(current, [biases[i]]) as number[][];
        if (i !== weights.length - 1) {
          current = current.map(x => x.map(hidden));
        }
      });

      current = current.map(x => x.map(output));
      return current[0];
    }
  }
}

