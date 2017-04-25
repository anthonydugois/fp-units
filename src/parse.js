// @flow

import R from 'ramda'

const re = () => /calc\((.+)\)|([+-]?[\d.]+(?:e?[+-]?[\d.]+)*)([a-z%]*)/gi
const UNIT_REGEX = re()
const OPERATORS_REGEX = /([/*]|[+-]\s)/g

const isNotNil = R.complement(R.isNil)

const getCalc = R.compose(String, R.nth(1))
const getValue = R.compose(Number, R.nth(2))
const getUnit = R.compose(String, R.nth(3))

const shouldProcessCalc = R.compose(isNotNil, R.nth(1))

const getPair = R.converge(R.pair, [getValue, getUnit])
const exec = str => UNIT_REGEX.exec(str)

const next = (str, arr) => res =>
  R.compose(getPairs(str), R.append(getPair(res)))(arr)

const getPairs = R.curryN(2, (str, arr) =>
  R.compose(R.ifElse(R.isNil, R.always(arr), next(str, arr)), exec)(str),
)

const splitByOp = R.split(OPERATORS_REGEX)

const execPair = R.ifElse(
  R.test(UNIT_REGEX),
  R.compose(getPair, str => re().exec(str)),
  R.identity,
)

const processCalc = R.compose(
  R.map(R.compose(execPair, R.trim)),
  splitByOp,
  getCalc,
)

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
export const parse: Parse = str => getPairs(str, [])
