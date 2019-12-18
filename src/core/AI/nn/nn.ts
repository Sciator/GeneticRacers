import { IANNActivationFunction, IANNActivationFunctionType, createExecutableFnc } from "./nnActivationFunctions";
import * as math from "mathjs";
import { random } from "mathjs";
import { range } from "../../common";

/** layer scheme for creating new nn */
export type IANNInitParams = {
  layerScheme: {
    inputs: number,
    hiddens: number[],
    outputs: number
  },
  afunction?: {
    hidden: IANNActivationFunction,
    output: IANNActivationFunction,
  }
};

/** values of nn */
type IANNDataValues = {
  weights: number[][][],
  biases: number[][],
};

export type IANNData = {
  readonly values: IANNDataValues;
  readonly functions: {
    hidden: IANNActivationFunction,
    output: IANNActivationFunction,
  }
};

// in -> *weights -> +bias -> hidd-fnc -> ... -> output

export class NeuralNet {
  /** values of nn */
  public readonly values: IANNDataValues;
  public readonly functions: {
    hidden: IANNActivationFunction,
    output: IANNActivationFunction,
  };

  /** creates predict function for given nn */
  public readonly predict = (input: number[]): number[] => {
    const { functions: { hidden: hidd, output: out, }, values, } = this;

    const hidden = createExecutableFnc(hidd);
    const output = createExecutableFnc(out);

    let current = [input,];
    const { biases, weights, } = values;

    range(biases.length).forEach((i) => {
      current = math.multiply(current, weights[i]) as number[][];
      current = math.add(current, [biases[i],]) as number[][];
      if (i !== weights.length - 1)
        current = current.map((x) => x.map(hidden));
    });

    current = current.map((x) => x.map(output));
    return current[0];
  }

  /** initialize new nn with given layer schema (and random values) */
  public static create = (nnInitParams: IANNInitParams): NeuralNet => {
    const out = {
      values: { biases: [] as number[][], weights: [] as number[][][] },
      functions: {
        hidden: { type: IANNActivationFunctionType.tanh, },
        output: { type: IANNActivationFunctionType.sigmoid, },
      },
    };

    if (nnInitParams.afunction)
      out.functions = nnInitParams.afunction;

    const { hiddens, inputs: input, outputs: output } = nnInitParams.layerScheme;

    // create tupples (input, hidden0) (hidden0, hidden1) ... (hiddenn, output)
    const tuples = [[input, hiddens[0],],] as [number, number][];
    [...hiddens, output,].slice(1).forEach((x) => tuples.push([tuples[tuples.length - 1][1], x]));

    out.values.weights = tuples.map(([l1, l2,]) =>
      range(l1).map(() => range(l2).map(() => random(-1, 1))));

    out.values.biases = [...hiddens, output,].map((x) => range(x).map(() => random(-1, 1)));

    return new NeuralNet(out);
  }

  constructor(nn: {
    values: IANNDataValues,
    functions: {
      hidden: IANNActivationFunction,
      output: IANNActivationFunction,
    }
  }) {
    const { functions, values } = nn;

    this.functions = functions;
    this.values = values;
  }
}

