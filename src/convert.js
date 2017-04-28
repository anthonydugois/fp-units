// @flow

import type { Values } from './types'

import R from 'ramda'
import * as defaults from './core/_defaults'
import * as is from './core/_is'
import * as selectors from './core/_selectors'
import { ast } from './core/_ast'
import { conv } from './core/_conv'

const CONVERTERS = {
  px: {
    px: defaults.__defaultConverter,
    cm: conv(R.always(R.divide(2.54, 96))),
    mm: conv(R.always(R.divide(25.4, 96))),
    q: conv(R.always(R.divide(101.6, 96))),
    in: conv(R.always(R.divide(1, 96))),
    pc: conv(R.always(R.divide(6, 96))),
    pt: conv(R.always(R.divide(72, 96))),
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
    rad: defaults.__defaultConverter,
    deg: conv(R.always(R.divide(180, Math.PI))),
    grad: conv(R.always(R.divide(200, Math.PI))),
    turn: conv(R.always(R.divide(1, R.multiply(2, Math.PI)))),
  },
  s: {
    s: defaults.__defaultConverter,
    ms: conv(R.always(1000)),
  },
  hz: {
    hz: defaults.__defaultConverter,
    khz: conv(R.always(10e-3)),
  },
  dppx: {
    dppx: defaults.__defaultConverter,
    dpi: conv(R.always(96)),
    dpcm: conv(R.always(R.divide(96, 2.54))),
  },
}

const getCanonical: (u: string) => ?string = selectors.makeGetCanonical(
  CONVERTERS,
)

const getConverter: (u: string) => Function = selectors.makeGlobalConverter(
  CONVERTERS,
)

const ofHead = R.compose(R.of, R.head)

const calcLeftRight: (
  p: (o: Object) => boolean,
) => (
  c: Object,
  u: string,
) => (n: Array<Object>) => Array<Object> = predicate => (
  config,
  unit,
) => nodes =>
  R.tail(nodes).reduce((acc, node, index, nodes) => {
    const prev = R.defaultTo({}, R.last(acc))
    const next = nodes[index + 1]

    if (is.isNodeOperator(node)) {
      if (predicate(node)) {
        const op = selectors.getValue(node)
        const f = selectors.getOperator(op)

        const left = Number(
          convert(
            config,
            unit,
            selectors.getUnitString(prev),
            selectors.getValueNumber(prev),
          ),
        )

        const right = Number(
          convert(
            config,
            unit,
            selectors.getUnitString(next),
            selectors.getValueNumber(next),
          ),
        )

        const value = String(f(left, right))
        const type = R.and(is.isNodeNumber(prev), is.isNodeNumber(next))
          ? 'Number'
          : 'Dimension'

        acc[acc.length - 1] = {
          ...acc[acc.length - 1],
          value,
          type,
          unit,
        }
      } else {
        acc.push(node, next)
      }
    }

    return acc
  }, ofHead(nodes))

const add: (
  c: Object,
  u: string,
) => (n: Array<Object>) => Array<Object> = calcLeftRight(is.isAdd)

const mult: (
  c: Object,
  u: string,
) => (n: Array<Object>) => Array<Object> = calcLeftRight(is.isMult)

const filterCalcNodes: (
  c: Object,
  u: string,
) => (n: Array<Object>) => Array<Object> = (config, unit) =>
  R.reduce((acc, node) => {
    if (is.isFunctionCalc(node)) {
      acc.push(calc(config, unit, selectors.getChildren(node)))
    }

    if (is.isFunctionCalcConcerned(node)) {
      acc.push(node)
    }

    return acc
  }, [])

const calc: (c: Object, u: string, n: Array<Object>) => Object = (
  config,
  unit,
  nodes,
) =>
  R.compose(
    R.defaultTo({}),
    R.head,
    add(config, unit),
    mult(config, unit),
    filterCalcNodes(config, unit),
  )(nodes)

const convertValue: (
  c: Object,
  u: string,
) => (n: Array<Object>) => Array<number> = (config, unit) => nodes =>
  R.reduce(
    (acc, node) => {
      if (is.isFunctionCalc(node)) {
        const _node = calc(config, unit, selectors.getChildren(node))
        const from = selectors.getUnitString(_node)
        const value = selectors.getValueNumber(_node)

        acc.push(Number(convert(config, unit, from, value)))
      }

      if (
        R.anyPass([is.isNodeDimension, is.isNodeNumber, is.isNodePercentage])(
          node,
        )
      ) {
        const from = selectors.getUnitString(node)
        const value = selectors.getValueNumber(node)

        acc.push(Number(convert(config, unit, from, value)))
      }

      return acc
    },
    [],
    nodes,
  )

/**
 * Naively converts a numeric value in the desired unit. This function is more granular than `converter`, but it does not handle automatic parsing, calc expressions and multiple conversions. This function is more useful when you need specialized converters.
 * @param {Object} config The config object.
 * @param {string} unit The desired unit.
 * @param {string} from The base unit.
 * @param {number} value The value to convert.
 * @return {number}
 * @example
 * import { convert } from 'fp-units'
 *
 * convert({}, 'rem', 'px', 32)
 * // 2
 *
 * convert({}, 'deg', 'rad', Math.PI)
 * // 180
 *
 * // Note: you can take advantage of automatic currying to have your own conversion API!
 * const rad2deg = convert({}, 'deg', 'rad')
 *
 * rad2deg(Math.PI)
 * // 180
 *
 * rad2deg(Math.PI / 4)
 * // 45
 */
export const convert: Convert<
  Object,
  string,
  number
> = R.curryN(4, (_config, _unit, _from, _value) => {
  const config = defaults.getDefaultConfig(_config)
  const canonicalUnit = getCanonical(_unit)

  if (R.isNil(canonicalUnit)) {
    throw new Error(`Unknown unit: \`${_unit}\` is not handled.`)
  }

  const from = R.when(R.isEmpty, R.always(String(canonicalUnit)))(_from)
  const canonicalFrom = getCanonical(from)

  if (R.isNil(canonicalFrom)) {
    throw new Error(`Unknown unit: \`${from}\` is not handled.`)
  }

  if (!R.equals(canonicalUnit, canonicalFrom)) {
    throw new Error(
      `Incompatible units: \`${from}\` cannot be converted to \`${_unit}\`.`,
    )
  }

  return R.compose(
    getConverter(_unit)(config, R.identity),
    getConverter(from)(config, R.divide(1)),
  )(_value)
})

/**
 * Creates a conversion function. The config allows you to adjust the parameters used to make conversions of relative units like `rem` or `%`.
 *
 * Note: if you don't provide unit, it will assume that the provided value is expressed in the canonical unit corresponding to the nature of the desired unit (e.g. `px` if the desired unit is a length).
 * @param {Object} config The config object.
 * @param {string} unit The desired unit.
 * @param {string|number|Array<string|number>} values The values and units to convert.
 * @return {Array<Array<number>>}
 * @example
 * import { converter } from 'fp-units'
 *
 * const to = converter({
 *   root: document.documentElement,
 *   element: document.querySelector('#foobar'),
 * })
 *
 * to('px', '30 2rem 4em 2rlh 4lh 50% 25vw 40vh 5vmin 10vmax')
 * // [30, 32, 96, 32, 104, 50, 480, 432, 54, 192]
 *
 * to('px', [30, '2rem', '4em'])
 * // [30, 32, 96]
 *
 * to('rem', 32)
 * // [2]
 *
 * to('rem', '32px')
 * // [2]
 */
export const converter: Converter<
  Object,
  string,
  Values
> = R.curryN(3, (config, unit, values) =>
  R.map(convertValue(config, unit), ast(values)),
)

console.log(converter({}, 'px', 50))
