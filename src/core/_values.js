// @flow

import R from 'ramda'
import { isString, isNumber, isArray } from './_is'
import { parse } from '../parse'

const toPair = n => R.pair(n, '')

// no point-free here because of hoisting limitations
const handleString = str => parse(str)
const handleNumber = n => R.compose(R.of, toPair)(n)
const handleArray = arr => R.map(R.compose(R.unnest, values), arr)

export const values = R.cond([
  [isString, handleString],
  [isNumber, handleNumber],
  [isArray, handleArray],
])
