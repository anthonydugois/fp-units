// @flow

import R from 'ramda'
import { parse, toPlainObject } from 'css-tree'
import { isString, isNumber, isArray } from './_is'

const getValueAst: (s: string) => Array<Object> = R.compose(
  R.propOr([], 'children'),
  str => toPlainObject(parse(str, { context: 'value' })),
)

const handleString: (s: string) => Array<Array<Object>> = R.compose(
  R.of,
  getValueAst,
)

const handleNumber: (n: number) => Array<Array<Object>> = R.compose(
  R.of,
  getValueAst,
  String,
)

const handleArray: (
  a: Array<number | string>,
) => Array<Array<Object>> = R.reduce((acc, v) => R.concat(acc, ast(v)), [])

export const ast: (v: any) => Array<Array<Object>> = R.cond([
  [isString, handleString],
  [isNumber, handleNumber],
  [isArray, handleArray],
])
