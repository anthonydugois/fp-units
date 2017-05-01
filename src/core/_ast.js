// @flow

import R from 'ramda'
import { parse, toPlainObject } from 'css-tree'

const n: (c: Object) => (s: string) => Object = cfg => str =>
  toPlainObject(parse(str, cfg))

const nodes: (s: string) => Object[] = R.compose(
  R.propOr([], 'children'),
  n({ context: 'value' }),
)

const handleString: (s: string) => Object[][] = R.compose(R.of, nodes)

const handleNumber: (n: number) => Object[][] = R.compose(R.of, nodes, String)

const handleArray: (a: (number | string)[]) => Object[][] = R.reduce(
  (acc, v) => R.concat(acc, ast(v)),
  [],
)

export const ast: (v: any) => Object[][] = R.cond([
  [R.is(String), handleString],
  [R.is(Number), handleNumber],
  [R.is(Array), handleArray],
])
