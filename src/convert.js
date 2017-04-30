// @flow

import type { Config, Values } from './types'

import R from 'ramda'
import * as defaults from './core/_defaults'
import * as is from './core/_is'
import * as selectors from './core/_selectors'
import { ast } from './core/_ast'
import { conv } from './core/_conv'

const CONVERTERS = {
  px: {
    px: defaults.__defaultConverter,
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
    rad: defaults.__defaultConverter,
    deg: conv(R.always(180 / Math.PI)),
    grad: conv(R.always(200 / Math.PI)),
    turn: conv(R.always(1 / (2 * Math.PI))),
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
    dpcm: conv(R.always(96 / 2.54)),
  },
}

const getCanonical: (u: string) => ?string = selectors.makeGetCanonical(
  CONVERTERS,
)

const getConverter: (
  u: string,
) => ConvFunc<Config> = selectors.makeGlobalConverter(CONVERTERS)

const ofHead = R.compose(R.of, R.head)

const calcLeftRight: (
  p: (o: Object) => boolean,
) => (c: Object, u: string) => (n: Object[]) => Object[] = predicate => (
  config,
  unit,
) => nodes =>
  R.tail(nodes).reduce((acc, node, index, nodes) => {
    const prev = R.defaultTo({}, R.last(acc))
    const next = nodes[index + 1]

    if (is.isNodeOperator(node)) {
      const op = selectors.getValue(node)
      const f = selectors.getOperator(op)

      if (op === '*') {
        if (!is.isNodeNumber(prev) && !is.isNodeNumber(next)) {
          throw new Error(
            `Invalid calc expression: at least one side of a multiplication should be a number.`,
          )
        }
      }

      if (op === '/') {
        if (!is.isNodeDimension(prev) && !is.isNodeNumber(prev)) {
          throw new Error(
            `Invalid calc expression: the left side of a division should be a dimension or a number.`,
          )
        }

        if (!is.isNodeNumber(next)) {
          throw new Error(
            `Invalid calc expression: the right side of a division should be a number.`,
          )
        }

        if (selectors.getValueNumber(next) === 0) {
          throw new Error(`Invalid calc expression: division by 0.`)
        }
      }

      const prevUnit = selectors.getUnitString(prev)
      const nextUnit = selectors.getUnitString(next)

      const canonicalPrevUnit = getCanonical(prevUnit)
      const canonicalNextUnit = getCanonical(nextUnit)

      if (!is.isNodeNumber(prev) && R.isNil(canonicalPrevUnit)) {
        throw new Error(
          `Invalid calc expression: Unknown unit: \`${prevUnit}\` is not handled.`,
        )
      }

      if (!is.isNodeNumber(next) && R.isNil(canonicalNextUnit)) {
        throw new Error(
          `Invalid calc expression: Unknown unit: \`${nextUnit}\` is not handled.`,
        )
      }

      if (
        !is.isNodeNumber(prev) &&
        !is.isNodeNumber(next) &&
        !R.equals(canonicalPrevUnit, canonicalNextUnit)
      ) {
        throw new Error(
          `Invalid calc expression: Incompatible units: calc operation between \`${prevUnit}\` and \`${nextUnit}\` cannot be performed.`,
        )
      }

      if (predicate(node)) {
        const _convertNode = convertNode(config, unit)
        const left = _convertNode(prev)
        const right = _convertNode(next)

        const value = String(f(left, right))
        const type = R.and(is.isNodeNumber(prev), is.isNodeNumber(next))
          ? 'Number'
          : 'Dimension'

        acc[acc.length - 1] = {
          type,
          value,
          ...(type === 'Dimension' ? { unit } : {}),
        }
      } else {
        acc.push(node, next)
      }
    }

    return acc
  }, ofHead(nodes))

const add: (c: Object, u: string) => (n: Object[]) => Object[] = calcLeftRight(
  is.isAdd,
)

const mult: (c: Object, u: string) => (n: Object[]) => Object[] = calcLeftRight(
  is.isMult,
)

const filterCalcNodes: (c: Object, u: string) => (n: Object[]) => Object[] = (
  config,
  unit,
) =>
  R.reduce((acc, node) => {
    if (is.isFunctionCalc(node)) {
      acc.push(calc(config, unit)(selectors.getChildren(node)))
    }

    if (is.isFunctionCalcConcerned(node)) {
      acc.push(node)
    }

    return acc
  }, [])

const calc: (c: Object, u: string) => (n: Object[]) => Object = (
  config,
  unit,
) =>
  R.compose(
    R.defaultTo({}),
    R.head,
    add(config, unit),
    mult(config, unit),
    filterCalcNodes(config, unit),
  )

const convertNodeDimension: (c: Object, u: string) => (n: Object) => number = (
  config,
  unit,
) =>
  R.compose(
    Number,
    R.converge(convert(config, unit), [
      selectors.getUnitString,
      selectors.getValueNumber,
    ]),
  )

const convertNode: (c: Object, u: string) => (n: Object) => number = (
  config,
  unit,
) =>
  R.cond([
    [is.isNodeNumber, selectors.getValueNumber],
    [is.isNodeDimension, convertNodeDimension(config, unit)],
  ])

const convertNodes: (c: Object, u: string) => (n: Object[]) => number[] = (
  config,
  unit,
) => nodes =>
  R.reduce(
    (acc, node) => {
      if (is.isFunctionCalc(node)) {
        const _node = calc(config, unit)(selectors.getChildren(node))
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
 * Naively converts a numeric value into the desired unit. This function is more granular than `converter`, but it does not handle automatic parsing, calc expressions and multiple conversions. This function is more useful when you need specialized converters.
 *
 * The config object allows you to adjust some parameters used to perform relative units conversions (e.g. `rem` or `%`).
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
 * Smartly converts the provided values into the desired unit. You can convert numbers, strings and calc expressions.
 *
 * Note: if the provided values don't have any unit, it will assume that they are expressed in the canonical unit corresponding to the nature of the desired unit (e.g. `px` if the desired unit is a length).
 * @param {Object} config The config object.
 * @param {string} unit The desired unit.
 * @param {string|number|Array<string|number>} values The values and units to convert.
 * @return {Array<Array<number>>}
 * @example
 * import { converter } from 'fp-units'
 *
 * const to = converter({
 *   node: document.querySelector('#foobar'),
 * })
 *
 * to('px', '30 2rem 4em 2rlh 4lh 50% 25vw 40vh 5vmin 10vmax')
 * // [[30, 32, 96, 32, 104, 50, 480, 432, 54, 192]]
 *
 * to('px', [30, '2rem 4px', '4em'])
 * // [[30], [32, 4], [96]]
 *
 * to('rem', 32)
 * // [[2]]
 *
 * to('rem', 'calc(2 * calc(12px + 4px))')
 * // [[2]]
 */
export const converter: Converter<
  Object,
  string,
  Values
> = R.curryN(3, (config, unit, values) =>
  R.map(convertNodes(config, unit), ast(values)),
)
