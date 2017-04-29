// @flow

export const conv: (
  co: (a: any) => number,
) => (c: Object, f: (a: any) => number) => (n: number) => number = coef => (
  cfg,
  f,
) => n => f(coef(cfg)) * n
