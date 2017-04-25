// @flow

import R from 'ramda'

// 1. Match calc groups: calc\((.+)\)
// 2. Match operators: ([/*]|[+-]\s)
// 3. Match values: ([+-]?\d+\.?\d*(?:e?[+-]?\d+\.?\d*)?)
// 4. Match units: ([a-z%]*)

const re = () =>
  /calc\((.+)\)|([/*]|[+-]\s)|([+-]?\d+\.?\d*(?:e?[+-]?\d+\.?\d*)?)([a-z%]*)/gi

const isNotNil = R.complement(R.isNil)

const nextMatch = (regex, str, arr) =>
  R.ifElse(
    isNotNil,
    match => nextMatch(regex, str, merge(match, arr)),
    R.always(arr),
  )(regex.exec(str))

const getMatches = R.curryN(2, (arr, str) => nextMatch(re(), str, arr))

const getCalc = R.compose(R.trim, String, R.nth(1))
const getOperator = R.compose(R.trim, String, R.nth(2))
const getValue = R.compose(Number, R.nth(3))
const getUnit = R.compose(R.trim, String, R.nth(4))

const getRecCalc = R.compose(getMatches([]), getCalc)
const getPair = R.converge(R.pair, [getValue, getUnit])

const isCalc = R.compose(isNotNil, R.nth(1))
const isOperator = R.compose(isNotNil, R.nth(2))

const dispatch = R.cond([
  [isCalc, getRecCalc],
  [isOperator, getOperator],
  [R.T, getPair],
])

const merge = (match, arr) => R.append(dispatch(match), arr)

/**
 * Parses a string and returns a list of `[value, unit]` pairs.
 * @param {string} str The string to parse.
 * @return {Array<Array<string|number>>}
 * @example
 * import { parse } from 'fp-units'
 *
 * parse('1px 3.054e-2em 50% 10')
 * // [[1, 'px'], [3.054e-2, 'em'], [50, '%'], [10, '']]
 */
export const parse: Parse = getMatches([])
