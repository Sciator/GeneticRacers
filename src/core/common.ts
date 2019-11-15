export const range = (a: number, b?: number) => {
  if (!b)
    return [...new Array(a).keys()];
  return [...new Array(b - a).keys()].map(x => x + a);
};
