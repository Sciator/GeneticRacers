import { IANNActivationFunction, IANNActivationFunctionType, createExecutableFnc } from "./nnActivationFunctions";
import * as math from "mathjs";
import { random } from "mathjs";
import { range } from "../../common";

/** layer scheme for creating new nn */
export type IANNInitParams = {
  readonly layerScheme: {
    readonly inputs: number,
    readonly hiddens: number[],
    readonly outputs: number
  },
  readonly afunction?: {
    readonly hidden: IANNActivationFunction,
    readonly output: IANNActivationFunction,
  }
};

/** values of nn */
type IANNDataValues = {
  readonly weights: readonly (readonly (readonly number[])[])[],
  readonly biases: readonly (readonly number[])[],
};

export type IANNData = {
  readonly values: IANNDataValues;
  readonly functions: {
    readonly hidden: IANNActivationFunction,
    readonly output: IANNActivationFunction,
  }
};

// in -> *weights -> +bias -> hidd-fnc -> ... -> output

const randomWeight = () => random(-1, 1);

const randomBoolean = (trueChance: number) => Math.random() < trueChance;

export class NeuralNet {
  /** values of nn */
  public readonly values: IANNDataValues;
  public readonly functions: {
    readonly hidden: IANNActivationFunction,
    readonly output: IANNActivationFunction,
  };

  /** creates predict function for given nn */
  public predict(input: number[]): number[] {
    const { functions: { hidden: hidd, output: out, }, values: { biases, weights, }, } = this;

    const hidden = createExecutableFnc(hidd);
    const output = createExecutableFnc(out);

    let current = [input,];

    range(biases.length).forEach((i) => {
      current = math.multiply(current, weights[i] as number[][]) as number[][];
      current = math.add(current, [biases[i]] as number[][]) as number[][];
      if (i !== weights.length - 1)
        current = current.map((x) => x.map(hidden));
    });

    current = current.map(x => x.map(output));
    return current[0];
  }

  // todo: breeding more nns together
  public mutate(rate: number): NeuralNet {
    return new NeuralNet({
      ...this, values: {
        biases: this.values.biases.map(b => b.map(x => randomBoolean(rate) ? randomWeight() : x)),
        weights: this.values.weights.map(w => w.map(y => y.map(x => randomBoolean(rate) ? randomWeight() : x))),
      },
    });
  }

  /** initialize new nn with given layer schema (and random values) */
  public static create(nnInitParams: IANNInitParams): NeuralNet{
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
      range(l1).map(() => range(l2).map(randomWeight)));

    out.values.biases = [...hiddens, output,].map((x) => range(x).map(randomWeight));

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

    const {mutate,predict} = this;
    [mutate, predict].forEach(x=>x.bind(this));
  }
}

