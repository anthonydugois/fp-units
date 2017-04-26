// @flow

import type { Values } from './types'

import R from 'ramda'
import parse from 'postcss-value-parser'
import * as defaults from './core/_defaults'
import { mock } from './core/_mock'

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
    em: conversion(R.compose(R.divide(1), defaults.getElementFontSize)),
    rlh: conversion(R.compose(R.divide(1), defaults.getRootLineHeight)),
    lh: conversion(R.compose(R.divide(1), defaults.getElementLineHeight)),
    '%': conversion(R.compose(R.divide(100), defaults.getElementSize)),
    vw: conversion(R.compose(R.divide(100), defaults.getViewportWidth)),
    vh: conversion(R.compose(R.divide(100), defaults.getViewportHeight)),
    vmin: conversion(R.compose(R.divide(100), defaults.getViewportMin)),
    vmax: conversion(R.compose(R.divide(100), defaults.getViewportMax)),
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

const safeCanonical: (b: string, m: Object) => Object = R.propOr({})

const hasUnit: (u: string, m: Object) => (b: string) => boolean = (
  unit,
  map,
) => base => R.has(unit, safeCanonical(base, map))

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

const getType = R.propOr('', 'type')
const getValue = R.propOr('', 'value')

const isFunction = R.compose(R.equals('function'), getType)
const isSpace = R.compose(R.equals('space'), getType)
const isWord = R.compose(R.equals('word'), getType)

const RE = /([+-]?\d*\.?\d*(?:e[+-]?\d*\.?\d*)?)([a-z%]*)/i

const isOperator = node => R.contains(getValue(node), ['+', '-', '/', '*'])
const isCalc = R.both(isFunction, R.compose(R.equals('calc'), getValue))
const isUnit = R.both(isWord, R.compose(R.test(RE), getValue))

const getNumber = R.compose(Number, R.nth(1))
const getUnit = R.compose(String, R.nth(2))

const getPair: (n: Object) => [number, string] = R.compose(
  R.converge(R.pair, [getNumber, getUnit]),
  R.match(RE),
  getValue,
)

const isMultiplicative = R.compose(
  R.either(R.equals('/'), R.equals('*')),
  getValue,
)
const isAdditive = R.compose(R.either(R.equals('+'), R.equals('-')), getValue)

const operator = R.cond([
  [R.equals('+'), R.always(R.add)],
  [R.equals('-'), R.always(R.subtract)],
  [R.equals('/'), R.always(R.divide)],
  [R.equals('*'), R.always(R.multiply)],
])

const additives = (config, unit, nodes) =>
  nodes.reduce((acc, node, index) => {
    if (index > 0) {
      const prev = R.last(acc)
      const next = nodes[index + 1]

      if (isOperator(node)) {
        if (isAdditive(node)) {
          const op = getValue(node)
          const f = operator(op)

          const left = convertPair(config, unit, getPair(prev))
          const right = convertPair(config, unit, getPair(next))

          acc[acc.length - 1].value = String(f(left, right))
        } else {
          acc.push(node, next)
        }
      }
    } else {
      acc.push(node)
    }

    return acc
  }, [])

const multiplicatives = (config, unit, nodes) =>
  nodes.reduce((acc, node, index) => {
    if (index > 0) {
      const prev = R.last(acc)
      const next = nodes[index + 1]

      if (isOperator(node)) {
        if (isMultiplicative(node)) {
          const op = getValue(node)
          const f = operator(op)

          const left = convertPair(config, unit, getPair(prev))
          const right = convertPair(config, unit, getPair(next))

          acc[acc.length - 1].value = String(f(left, right))
        } else {
          acc.push(node, next)
        }
      }
    } else {
      acc.push(node)
    }

    return acc
  }, [])

const filter = (config, unit, nodes) =>
  nodes.reduce((acc, node) => {
    if (R.either(isUnit, isOperator)(node)) {
      acc.push(node)
    }

    if (isCalc(node)) {
      acc.push(calc(config, unit, node))
    }

    return acc
  }, [])

const calc = (config, unit, { nodes }) =>
  R.head(
    additives(
      config,
      unit,
      multiplicatives(config, unit, filter(config, unit, nodes)),
    ),
  )

const convertPair = (config, unit, [value, from]) =>
  convert(config, unit, from, value)

const convertNode: (c: Object, u: string) => (n: Object) => Array<number> = (
  config,
  unit,
) => ({ nodes }) =>
  nodes.reduce((acc, node) => {
    if (isCalc(node)) {
      acc.push(convertPair(config, unit, getPair(calc(config, unit, node))))
    }

    if (isUnit(node)) {
      acc.push(convertPair(config, unit, getPair(node)))
    }

    return acc
  }, [])

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
> = R.curryN(4, (config, unit, _from, value) => {
  const canonicalUnit = getCanonical(unit)

  if (R.isNil(canonicalUnit)) {
    throw new Error(`Unknown unit: \`${unit}\` is not handled.`)
  }

  const from = R.when(R.isEmpty, R.always(String(canonicalUnit)))(_from)
  const canonicalFrom = getCanonical(from)

  if (R.isNil(canonicalFrom)) {
    throw new Error(`Unknown unit: \`${from}\` is not handled.`)
  }

  if (!R.equals(canonicalUnit, canonicalFrom)) {
    throw new Error(
      `Incompatible units: \`${from}\` cannot be converted to \`${unit}\`.`,
    )
  }

  return R.compose(
    getConverter(unit)(config, R.identity),
    getConverter(from)(config, R.divide(1)),
  )(value)
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
> = R.curryN(3, (c, u, v) => R.map(convertNode(c, u), mock(v)))
