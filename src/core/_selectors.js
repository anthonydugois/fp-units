// @flow

import type { Config } from '../types'

import R from 'ramda'
import { isNodePercentage } from './_is'
import convs from './_converters'

const getUnit: (n: Object) => string = node =>
  (isNodePercentage(node) ? '%' : R.propOr('', 'unit', node))

export const getValueNumber: (n: Object) => number = R.compose(
  Number,
  R.propOr('', 'value'),
)

export const getUnitString: (n: Object) => string = R.compose(String, getUnit)

export const makeGetCanonical: (
  m: Object,
) => (u: string) => ?string = map => unit =>
  R.find(base => R.has(unit, R.propOr({}, base, map)), R.keys(map))

const pathToConverter: (m: Object, u: string) => (c: string) => Function = (
  map,
  unit,
) => canonical => R.pathOr(convs.px.px, [canonical, unit], map)

export const makeGlobalConv: (
  m: Object,
) => (u: string) => ConvF<Config> = map => unit =>
  R.ifElse(R.isNil, R.always(convs.px.px), pathToConverter(map, unit))(
    makeGetCanonical(map)(unit),
  )

export const getCanonical: (u: string) => ?string = makeGetCanonical(convs)

export const getConverter: (u: string) => ConvF<Config> = makeGlobalConv(convs)

export const getOperator: (
  s: string,
) => (l: number, r: number) => number = R.cond([
  [R.equals('+'), R.always(R.add)],
  [R.equals('-'), R.always(R.subtract)],
  [R.equals('/'), R.always(R.divide)],
  [R.equals('*'), R.always(R.multiply)],
])
