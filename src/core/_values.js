// @flow

import R from 'ramda'
import { isString, isNumber, isArray } from './_is'
import { parse } from '../parse'

const toPair = n => R.pair(n, '')
const concat = (acc, v) => R.concat(acc, values(v))

const handleString = parse
const handleNumber = R.compose(R.of, toPair)
const handleArray = R.reduce(concat, [])

export const values = R.cond([
  [isString, handleString],
  [isNumber, handleNumber],
  [isArray, handleArray],
])
