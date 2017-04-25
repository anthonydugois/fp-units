// @flow

import R from 'ramda'

export const isBrowser = R.always(typeof window !== 'undefined')
export const isHTMLElement = R.both(isBrowser, v => R.is(HTMLElement, v))
export const isString = R.is(String)
export const isNumber = R.is(Number)
export const isArray = R.is(Array)
