// @flow

import R from 'ramda'
import { getName, getType, getValue } from './_selectors'

export const isWindow = R.always(typeof window !== 'undefined')

export const isDocument = R.always(typeof document !== 'undefined')

export const isBrowser = R.both(isWindow, isDocument)

export const isHTMLElement = R.both(isBrowser, v => R.is(HTMLElement, v))

export const isString = R.is(String)

export const isNumber = R.is(Number)

export const isArray = R.is(Array)

export const isNodeFunction = R.compose(R.equals('Function'), getType)

export const isNodeNumber = R.compose(R.equals('Number'), getType)

export const isNodePercentage = R.compose(R.equals('Percentage'), getType)

export const isNodeDimension = R.compose(R.equals('Dimension'), getType)

export const isNodeOperator = R.compose(R.equals('Operator'), getType)

export const isFunctionCalc = R.both(
  isNodeFunction,
  R.compose(R.equals('calc'), getName),
)

export const isFunctionCalcConcerned = R.anyPass([
  isNodeNumber,
  isNodePercentage,
  isNodeDimension,
  isNodeOperator,
])

export const isMult = R.compose(
  R.either(R.equals('/'), R.equals('*')),
  getValue,
)

export const isAdd = R.compose(R.either(R.equals('+'), R.equals('-')), getValue)
