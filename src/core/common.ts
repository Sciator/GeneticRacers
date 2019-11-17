export const range = (a: number, b?: number) => {
  if (!b)
    return [...new Array(a).keys()];
  return [...new Array(b - a).keys()].map(x => x + a);
};

export function zip<A, B>(arr1: A[], arr2: B[]) {
  return arr1.map((k, i) => [k, arr2[i]]) as [A, B][];
}
