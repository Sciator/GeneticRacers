export const range: {
  (size: number): number[];
  (min: number, max: number): number[];
} = (n: number, m?: number): number[] => {
  if (!m)
    return [...new Array(n).keys()];
  return [...new Array(m - n).keys()].map((x) => x + n);
};

export const zip = <T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][] =>
  range(arr1.length).map(x => [arr1[x], arr2[x]]) as [T1, T2][];

/** use inside reduce to flatten array (1 level flattening) */
export const flatReducer = <T>(a: T[], b: T[]) => a.concat(b);

/** split array to chunks of given length */
export const splitToChunks = <T>(arr: T[], chunkSize: number): T[][] => range(Math.ceil(arr.length / chunkSize))
  .map((x) => arr.slice(x * chunkSize, (x + 1) * chunkSize))
  ;
