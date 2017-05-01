// @flow

import type { Config, Coef } from '../types'

const conv: (c: Coef) => ConvF<Config> = c => (cfg, f) => n => f(c(cfg)) * n

export default conv
