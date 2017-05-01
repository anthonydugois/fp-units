// @flow

import type { Is } from '../types'

import R from 'ramda'

export const isHTMLElement: Is = R.both(
  () => typeof window !== 'undefined' && typeof document !== 'undefined',
  v => R.is(HTMLElement, v),
)

export const isNodeFunction: Is = R.compose(
  R.equals('Function'),
  R.propOr('', 'type'),
)

export const isNodeNumber: Is = R.compose(
  R.equals('Number'),
  R.propOr('', 'type'),
)

export const isNodePercentage: Is = R.compose(
  R.equals('Percentage'),
  R.propOr('', 'type'),
)

export const isNodeDimension: Is = R.compose(
  R.equals('Dimension'),
  R.propOr('', 'type'),
)

export const isNodeOperator: Is = R.compose(
  R.equals('Operator'),
  R.propOr('', 'type'),
)

export const isFunctionCalc: Is = R.both(
  isNodeFunction,
  R.compose(R.equals('calc'), R.propOr('', 'name')),
)

export const isFunctionCalcConcerned: Is = R.anyPass([
  isNodeNumber,
  isNodePercentage,
  isNodeDimension,
  isNodeOperator,
])

export const isMult: Is = R.compose(
  R.either(R.equals('/'), R.equals('*')),
  R.propOr('', 'value'),
)

export const isAdd: Is = R.compose(
  R.either(R.equals('+'), R.equals('-')),
  R.propOr('', 'value'),
)
