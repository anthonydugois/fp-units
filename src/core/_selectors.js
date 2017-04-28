// @flow

import R from 'ramda'
import { isNodePercentage } from './_is'
import { __defaultConverter } from './_defaults'

export const getType: (n: Object) => string = R.propOr('', 'type')

export const getValue: (n: Object) => string = R.propOr('', 'value')

export const getName: (n: Object) => string = R.propOr('', 'name')

export const getChildren: (n: Object) => Array<Object> = R.propOr(
  [],
  'children',
)

const getUnit: (n: Object) => string = node =>
  (isNodePercentage(node) ? '%' : R.propOr('', 'unit', node))

export const getValueNumber: (n: Object) => number = R.compose(Number, getValue)

export const getUnitString: (n: Object) => string = R.compose(String, getUnit)

const hasUnit: (u: string, m: Object) => (b: string) => boolean = (
  unit,
  map,
) => base => R.has(unit, R.propOr({}, base, map))

export const makeGetCanonical: (
  m: Object,
) => (u: string) => ?string = map => unit =>
  R.find(hasUnit(unit, map), R.keys(map))

const pathToConverter: (m: Object, u: string) => (c: string) => Function = (
  map,
  unit,
) => canonical => R.pathOr(__defaultConverter, [canonical, unit], map)

export const makeGlobalConverter: (
  m: Object,
) => (u: string) => Function = map => unit =>
  R.ifElse(R.isNil, R.always(__defaultConverter), pathToConverter(map, unit))(
    makeGetCanonical(map)(unit),
  )

export const getOperator: (
  s: string,
) => (l: number, r: number) => number = R.cond([
  [R.equals('+'), R.always(R.add)],
  [R.equals('-'), R.always(R.subtract)],
  [R.equals('/'), R.always(R.divide)],
  [R.equals('*'), R.always(R.multiply)],
])
