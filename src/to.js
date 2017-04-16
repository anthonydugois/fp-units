// @flow

import type { Converter, To } from './types'

import R from 'ramda'
import { parse } from './parse'
import * as defaults from './defaults'

const conversion = coef => (config, f) => n => f(coef(config)) * n

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

const BASE_UNITS = R.keys(CONVERTERS)

const getBaseUnit = unit =>
  R.find(base => R.has(unit, R.prop(base, CONVERTERS)), BASE_UNITS)

const getConverter = unit =>
  R.compose(R.prop(unit), R.prop(getBaseUnit(unit)))(CONVERTERS)

const convert = R.curryN(3, (config, unit, [value, from]) => {
  if (getBaseUnit(unit) !== getBaseUnit(from)) {
    throw new Error(`Incompatible units: can't convert ${from} to ${unit}.`)
  }

  return R.compose(
    getConverter(unit)(config, R.identity),
    getConverter(from)(config, R.divide(1)),
  )(value)
})

/**
 * Creates a conversion function. The config allows you to adjust the parameters used to make conversions of relative units like rem or %.
 * @param {Object} config The config object.
 * @param {string} unit The desired unit.
 * @param {string} str A string of values and units to convert.
 * @return {Array<number>}
 * @example
 * import { converter } from 'fp-units'
 *
 * const to = converter({
 *   root: document.documentElement,
 *   element: document.querySelector('#foobar'),
 * })
 *
 * to('px', '2rem 4em 2rlh 4lh 50% 25vw 40vh 5vmin 10vmax')
 * // [32, 96, 32, 104, 50, 480, 432, 54, 192]
 */
export const converter: Converter = R.curryN(3, (config, unit, str) =>
  R.map(convert(config, unit), parse(str)),
)

/**
 * Converts CSS units. This function is a shortcut to bypass config (convenient if you don't need to convert relative units).
 * @param {string} unit The desired unit.
 * @param {string} str A string of values and units to convert.
 * @return {Array<number>}
 * @example
 * import { to } from 'fp-units'
 *
 * to('px', '100px 2cm 15mm 4q 4in 30pc 24pt')
 * // [100, 75.59055, 56.69291, 3.77953, 384, 480, 32]
 */
export const to: To = converter({})
