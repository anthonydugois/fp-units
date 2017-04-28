// @flow

import type { Values } from './types'

import R from 'ramda'
import * as defaults from './core/_defaults'
import { ast } from './core/_ast'

const conversion: (
  f: Function,
) => (c: Object, d: Function) => (n: number) => number = coef => (
  config,
  f,
) => n => f(coef(config)) * n

const CONVERTERS = {
  px: {
    px: conversion(R.always(1)),
    cm: conversion(R.always(R.divide(2.54, 96))),
    mm: conversion(R.always(R.divide(25.4, 96))),
    q: conversion(R.always(R.divide(101.6, 96))),
    in: conversion(R.always(R.divide(1, 96))),
    pc: conversion(R.always(R.divide(6, 96))),
    pt: conversion(R.always(R.divide(72, 96))),
    rem: conversion(R.compose(R.divide(1), defaults.getRootFontSize)),
    em: conversion(R.compose(R.divide(1), defaults.getNodeFontSize)),
    rlh: conversion(R.compose(R.divide(1), defaults.getRootLineHeight)),
    lh: conversion(R.compose(R.divide(1), defaults.getNodeLineHeight)),
    '%': conversion(R.compose(R.divide(100), defaults.getNodeSize)),
    vw: conversion(R.compose(R.divide(100), defaults.getViewportWidth)),
    vh: conversion(R.compose(R.divide(100), defaults.getViewportHeight)),
    vmin: conversion(R.compose(R.divide(100), defaults.getViewportMin)),
    vmax: conversion(R.compose(R.divide(100), defaults.getViewportMax)),
    // todo: ch, ex
  },
  rad: {
    rad: conversion(R.always(1)),
    deg: conversion(R.always(R.divide(180, Math.PI))),
    grad: conversion(R.always(R.divide(200, Math.PI))),
    turn: conversion(R.always(R.divide(1, R.multiply(2, Math.PI)))),
  },
  s: {
    s: conversion(R.always(1)),
    ms: conversion(R.always(1000)),
  },
  hz: {
    hz: conversion(R.always(1)),
    khz: conversion(R.always(10e-3)),
  },
  dppx: {
    dppx: conversion(R.always(1)),
    dpi: conversion(R.always(96)),
    dpcm: conversion(R.always(R.divide(96, 2.54))),
  },
}

const hasUnit: (u: string, m: Object) => (b: string) => boolean = (
  unit,
  map,
) => base => R.has(unit, R.propOr({}, base, map))

const makeGetCanonical: (m: Object) => (u: string) => ?string = map => unit =>
  R.find(hasUnit(unit, map), R.keys(map))

const getCanonical: (u: string) => ?string = makeGetCanonical(CONVERTERS)

const makeGlobalConverter: (
  m: Object,
) => (u: string) => Function = map => unit =>
  R.ifElse(
    R.isNil,
    R.always(conversion(R.always(1))),
    canonical => map[canonical][unit],
  )(getCanonical(unit))

const getConverter: (u: string) => Function = makeGlobalConverter(CONVERTERS)

const getType: (n: Object) => string = R.propOr('', 'type')
const getValue: (n: Object) => string = R.propOr('', 'value')
const getName: (n: Object) => string = R.propOr('', 'name')
const getUnit: (n: Object) => string = R.propOr('', 'unit')
const getChildren: (n: Object) => Array<Object> = R.propOr([], 'children')

const getValueNumber: (n: Object) => number = R.compose(Number, getValue)
const getUnitString: (n: Object) => string = R.compose(String, getUnit)

const isFunction = R.compose(R.equals('Function'), getType)
const isNumber = R.compose(R.equals('Number'), getType)
const isDimension = R.compose(R.equals('Dimension'), getType)
const isOperator = R.compose(R.equals('Operator'), getType)

const isCalc = R.both(isFunction, R.compose(R.equals('calc'), getName))
const isCalcConcerned = R.anyPass([isNumber, isDimension, isOperator])

const isMult = R.compose(R.either(R.equals('/'), R.equals('*')), getValue)
const isAdd = R.compose(R.either(R.equals('+'), R.equals('-')), getValue)

const operator: (s: string) => Function = R.cond([
  [R.equals('+'), R.always(R.add)],
  [R.equals('-'), R.always(R.subtract)],
  [R.equals('/'), R.always(R.divide)],
  [R.equals('*'), R.always(R.multiply)],
])

const additives = (config, unit, nodes) =>
  R.tail(nodes).reduce((acc, node, index, nodes) => {
    const prev = R.defaultTo({}, R.last(acc))
    const next = nodes[index + 1]

    if (isOperator(node)) {
      if (isAdd(node)) {
        const op = getValue(node)
        const f = operator(op)

        const left = convert(
          config,
          unit,
          getUnitString(prev),
          getValueNumber(prev),
        )

        const right = convert(
          config,
          unit,
          getUnitString(next),
          getValueNumber(next),
        )

        const value = String(f(left, right))
        const type = R.and(isNumber(prev), isNumber(next))
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
  }, R.of(R.head(nodes)))

const multiplicatives = (config, unit, nodes) =>
  R.tail(nodes).reduce((acc, node, index, nodes) => {
    const prev = R.defaultTo({}, R.last(acc))
    const next = nodes[index + 1]

    if (isOperator(node)) {
      if (isMult(node)) {
        const op = getValue(node)
        const f = operator(op)

        const left = convert(
          config,
          unit,
          getUnitString(prev),
          getValueNumber(prev),
        )

        const right = convert(
          config,
          unit,
          getUnitString(next),
          getValueNumber(next),
        )

        const value = String(f(left, right))
        const type = R.and(isNumber(prev), isNumber(next))
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
  }, R.of(R.head(nodes)))

const filterCalcNodes: (
  c: Object,
  u: string,
  n: Array<Object>,
) => Array<Object> = (config, unit, nodes) =>
  R.reduce(
    (acc, node) => {
      if (isCalc(node)) {
        acc.push(calc(config, unit, getChildren(node)))
      }

      if (isCalcConcerned(node)) {
        acc.push(node)
      }

      return acc
    },
    [],
    nodes,
  )

const calc = R.curryN(3, (config, unit, nodes) =>
  R.head(
    additives(
      config,
      unit,
      multiplicatives(config, unit, filterCalcNodes(config, unit, nodes)),
    ),
  ),
)

const convertValue: (
  c: Object,
  u: string,
) => (n: Array<Object>) => Array<number> = (config, unit) => nodes =>
  R.reduce(
    (acc, node) => {
      if (isCalc(node)) {
        const _node = calc(config, unit, getChildren(node))
        const from = getUnitString(_node)
        const value = getValueNumber(_node)

        acc.push(Number(convert(config, unit, from, value)))
      }

      if (R.or(isDimension(node), isNumber(node))) {
        const from = getUnitString(node)
        const value = getValueNumber(node)

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
> = R.curryN(3, (c, u, v) => R.map(convertValue(c, u), ast(v)))
