// @flow

import R from 'ramda'
import { parse, toPlainObject } from 'css-tree'
import { isString, isNumber, isArray } from './_is'
import { getChildren } from './_selectors'

const n: (c: Object) => (s: string) => Object = cfg => str =>
  toPlainObject(parse(str, cfg))

const nodes: (s: string) => Object[] = R.compose(
  getChildren,
  n({ context: 'value' }),
)

const handleString: (s: string) => Object[][] = R.compose(R.of, nodes)

const handleNumber: (n: number) => Object[][] = R.compose(R.of, nodes, String)

const handleArray: (a: (number | string)[]) => Object[][] = R.reduce(
  (acc, v) => R.concat(acc, ast(v)),
  [],
)

export const ast: (v: any) => Object[][] = R.cond([
  [isString, handleString],
  [isNumber, handleNumber],
  [isArray, handleArray],
])
