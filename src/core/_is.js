// @flow

import R from 'ramda'
import { getName, getType, getValue } from './_selectors'

export const isWindow: () => boolean = R.always(typeof window !== 'undefined')

export const isDocument: () => boolean = R.always(
  typeof document !== 'undefined',
)

export const isBrowser: () => boolean = R.both(isWindow, isDocument)

export const isHTMLElement: (n: Object) => boolean = R.both(isBrowser, v =>
  R.is(HTMLElement, v),
)

export const isString: (a: any) => boolean = R.is(String)

export const isNumber: (a: any) => boolean = R.is(Number)

export const isArray: (a: any) => boolean = R.is(Array)

export const isNodeFunction: (n: Object) => boolean = R.compose(
  R.equals('Function'),
  getType,
)

export const isNodeNumber: (n: Object) => boolean = R.compose(
  R.equals('Number'),
  getType,
)

export const isNodePercentage: (n: Object) => boolean = R.compose(
  R.equals('Percentage'),
  getType,
)

export const isNodeDimension: (n: Object) => boolean = R.compose(
  R.equals('Dimension'),
  getType,
)

export const isNodeOperator: (n: Object) => boolean = R.compose(
  R.equals('Operator'),
  getType,
)

export const isFunctionCalc: (n: Object) => boolean = R.both(
  isNodeFunction,
  R.compose(R.equals('calc'), getName),
)

export const isFunctionCalcConcerned: (n: Object) => boolean = R.anyPass([
  isNodeNumber,
  isNodePercentage,
  isNodeDimension,
  isNodeOperator,
])

export const isMult: (n: Object) => boolean = R.compose(
  R.either(R.equals('/'), R.equals('*')),
  getValue,
)

export const isAdd: (n: Object) => boolean = R.compose(
  R.either(R.equals('+'), R.equals('-')),
  getValue,
)
