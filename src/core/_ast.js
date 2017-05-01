// @flow

import R from 'ramda'
import { parse, toPlainObject } from 'css-tree'

const nodes: (s: string) => Object[] = str =>
  R.propOr([], 'children', toPlainObject(parse(str, { context: 'value' })))

const ast: (v: any) => Object[][] = R.cond([
  [R.is(String), R.compose(R.of, nodes)],
  [R.is(Number), R.compose(R.of, nodes, String)],
  [R.is(Array), R.reduce((acc, v) => R.concat(acc, ast(v)), [])],
])

export default ast
