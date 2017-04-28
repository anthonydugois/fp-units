// @flow

export const conv: (
  f: Function,
) => (c: Object, d: Function) => (n: number) => number = coef => (
  config,
  f,
) => n => f(coef(config)) * n
