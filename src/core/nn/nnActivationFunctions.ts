import { IFunctionReal } from "../types";


// todo: komentář k enumu
export enum IANNActivationFunctionType { sigmoid = "sigmoid", tanh = "tanh", relu = "relu" }
/** function definitions for nn */
export type IANNActivationFunction = {
  type: IANNActivationFunctionType
};


//todo: odestranit komentář
/* sigmoid -> výstup [0,1] vahlazený */
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

/* oříznutí -> výstup [0,1] vahlazený */
export const relu = (x: number) => x < 0 ? 0 : x;

/* náhrada za sigmoid, mapuje na [-1,1] */
export const tanh = (x: number) => Math.tanh(x);


export const createExecutableFnc = (aFnc: IANNActivationFunction): IFunctionReal => {
  switch (aFnc.type) {
    case IANNActivationFunctionType.relu: return relu;
    case IANNActivationFunctionType.sigmoid: return sigmoid;
    case IANNActivationFunctionType.tanh: return tanh;
    default: throw new Error(`invalid function params ${JSON.stringify(aFnc)}`)
  }
}