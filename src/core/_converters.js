// @flow

import R from 'ramda'
import * as defaults from './_defaults'
import conv from './_conv'

export default {
  px: {
    px: conv(R.always(1)),
    cm: conv(R.always(2.54 / 96)),
    mm: conv(R.always(25.4 / 96)),
    q: conv(R.always(101.6 / 96)),
    in: conv(R.always(1 / 96)),
    pc: conv(R.always(6 / 96)),
    pt: conv(R.always(72 / 96)),
    rem: conv(R.compose(R.divide(1), defaults.getRootFontSize)),
    em: conv(R.compose(R.divide(1), defaults.getNodeFontSize)),
    rlh: conv(R.compose(R.divide(1), defaults.getRootLineHeight)),
    lh: conv(R.compose(R.divide(1), defaults.getNodeLineHeight)),
    '%': conv(R.compose(R.divide(100), defaults.getNodeSize)),
    vw: conv(R.compose(R.divide(100), defaults.getViewportWidth)),
    vh: conv(R.compose(R.divide(100), defaults.getViewportHeight)),
    vmin: conv(R.compose(R.divide(100), defaults.getViewportMin)),
    vmax: conv(R.compose(R.divide(100), defaults.getViewportMax)),
    // todo: ch, ex
  },
  rad: {
    rad: conv(R.always(1)),
    deg: conv(R.always(180 / Math.PI)),
    grad: conv(R.always(200 / Math.PI)),
    turn: conv(R.always(1 / (2 * Math.PI))),
  },
  s: {
    s: conv(R.always(1)),
    ms: conv(R.always(1000)),
  },
  hz: {
    hz: conv(R.always(1)),
    khz: conv(R.always(10e-3)),
  },
  dppx: {
    dppx: conv(R.always(1)),
    dpi: conv(R.always(96)),
    dpcm: conv(R.always(96 / 2.54)),
  },
}
