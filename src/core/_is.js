// @flow

import R from 'ramda'

export const isHTMLElement: (n: Object) => boolean = R.both(
  () => typeof window !== 'undefined' && typeof document !== 'undefined',
  v => R.is(HTMLElement, v),
)

export const isNodeFunction: (n: Object) => boolean = R.compose(
  R.equals('Function'),
  R.propOr('', 'type'),
)

export const isNodeNumber: (n: Object) => boolean = R.compose(
  R.equals('Number'),
  R.propOr('', 'type'),
)

export const isNodePercentage: (n: Object) => boolean = R.compose(
  R.equals('Percentage'),
  R.propOr('', 'type'),
)

export const isNodeDimension: (n: Object) => boolean = R.compose(
  R.equals('Dimension'),
  R.propOr('', 'type'),
)

export const isNodeOperator: (n: Object) => boolean = R.compose(
  R.equals('Operator'),
  R.propOr('', 'type'),
)

export const isFunctionCalc: (n: Object) => boolean = R.both(
  isNodeFunction,
  R.compose(R.equals('calc'), R.propOr('', 'name')),
)

export const isFunctionCalcConcerned: (n: Object) => boolean = R.anyPass([
  isNodeNumber,
  isNodePercentage,
  isNodeDimension,
  isNodeOperator,
])

export const isMult: (n: Object) => boolean = R.compose(
  R.either(R.equals('/'), R.equals('*')),
  R.propOr('', 'value'),
)

export const isAdd: (n: Object) => boolean = R.compose(
  R.either(R.equals('+'), R.equals('-')),
  R.propOr('', 'value'),
)
