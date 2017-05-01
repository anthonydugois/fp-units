// @flow

import type { Config } from '../types'

const config: (c?: Object) => Config = (cfg = {}) => ({
  window: typeof window !== 'undefined'
    ? window
    : {
        innerWidth: 0,
        innerHeight: 0,
      },
  document: typeof document !== 'undefined'
    ? document
    : {
        lineHeight: 16,
        fontSize: 16,
      },
  node: {
    width: 0,
    lineHeight: 16,
    fontSize: 16,
  },
  property: 'width',
  ...cfg,
})

export default config
