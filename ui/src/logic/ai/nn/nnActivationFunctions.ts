import { IFReal } from "../../../core/types";

export enum IANNActivationFunctionType { sigmoid = "sigmoid", tanh = "tanh", relu = "relu" }
/** function definitions for nn */
export type IANNActivationFunction = {
  type: IANNActivationFunctionType,
};

export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export const relu = (x: number) => x < 0 ? 0 : x;
export const tanh = (x: number) => Math.tanh(x);

export const createExecutableFnc = (aFnc: IANNActivationFunction): IFReal => {
  switch (aFnc.type) {
    case IANNActivationFunctionType.relu: return relu;
    case IANNActivationFunctionType.sigmoid: return sigmoid;
    case IANNActivationFunctionType.tanh: return tanh;
    default: throw new Error(`invalid function params ${JSON.stringify(aFnc)}`);
  }
};
