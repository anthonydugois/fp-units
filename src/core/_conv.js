// @flow

import type { Config } from '../types'

export const conv: (c: (a: any) => number) => ConvF<Config> = coef => (
  cfg,
  f,
) => n => f(coef(cfg)) * n
