export const range: {
  /** creates array with numbers from 0 to max-1 */
  (maxExcluded: number): number[];
  /** creates array with numbers from min to max-1 */
  (minIncluded: number, maxExcluded: number): number[];
} = (a: number, b?: number): number[] => {
  const arr = [];
  if (b === undefined)
    for (let i = 0; i < a; i++)
      arr.push(i);
  else
    for (let i = a; i < b; i++)
      arr.push(i);
  return arr;
};

export const zip = <T1, T2>(arr1: T1[] | readonly T1[], arr2: T2[] | readonly T2[]): [T1, T2][] =>
  range(arr1.length).map(x => [arr1[x], arr2[x]]) as [T1, T2][];

/** use inside reduce to flatten array (1 level flattening) */
export const flatReducer = <T>(a: T[], b: T[]) => a.concat(b);

/** split array to chunks of given length */
export const splitToChunks = <T>(arr: T[], chunkSize: number): T[][] => range(Math.ceil(arr.length / chunkSize))
  .map((x) => arr.slice(x * chunkSize, (x + 1) * chunkSize))
  ;

export const throwReturn = <T>(message: string): T => {
  throw new Error(message);
};

/** Shuffle given array */
export const shuffle = <T>(arr: T[]) => {
  const swap = (i: number, j: number) => {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    swap(i, j);
  }
};

export const randInt: {
  /** generates ranodm integer number */
  (maxExcluded: number): number;
  /** generates ranodm integer number */
  (minIncluded: number, maxExcluded: number): number;
} = (a: number, b?: number): number => {
  if (b === undefined) {
    return Math.floor(Math.random() * a);
  }
  else {
    return Math.floor(Math.random() * (b - a)) + a;
  }
};