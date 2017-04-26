// @flow

import R from 'ramda'
import parse from 'postcss-value-parser'
import { isString, isNumber, isArray } from './_is'

const handleString: (s: string) => Array<Object> = R.compose(R.of, parse)

const handleNumber: (n: number) => Array<Object> = R.compose(
  R.of,
  parse,
  String,
)

const handleArray: (a: Array<number | string>) => Array<Object> = R.reduce(
  (acc, v) => R.concat(acc, mock(v)),
  [],
)

export const mock: (v: any) => Array<Object> = R.cond([
  [isString, handleString],
  [isNumber, handleNumber],
  [isArray, handleArray],
])
