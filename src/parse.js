// @flow

import type { Parse } from './types'

import R from 'ramda'

const UNIT_REGEX = /([\d.+-]+(?:e?[\d.+-]+)*)\s*([a-z%]*)/gi

const getPair = R.compose(
  R.adjust(String, 1),
  R.adjust(Number, 0),
  R.slice(1, 3),
)

const getMatch = str => UNIT_REGEX.exec(str)

const next = (str, arr) => res =>
  R.compose(getPairs(str), R.append(getPair(res)))(arr)

const getPairs = R.curryN(2, (str, arr) =>
  R.compose(R.ifElse(R.isNil, R.always(arr), next(str, arr)), getMatch)(str),
)

/**
 * Parses a string and returns a list of [value, unit] pairs.
 * @param {string} str The string to parse.
 * @return {Array.<Array.<string|number>>}
 * @example
 * import { parse } from 'fp-units'
 *
 * parse('1px 3.054e-2em 50% 10')
 * // [[1, 'px'], [3.054e-2, 'em'], [50, '%'], [10, '']]
 */
export const parse: Parse = str => getPairs(str, [])
