// @flow

import R from 'ramda'
import parse from 'postcss-value-parser'
import { isBrowser, isHTMLElement } from './_is'

const vw = isBrowser() ? window.innerWidth : 0
const vh = isBrowser() ? window.innerHeight : 0
const getNumber = R.compose(Number, R.propOr(0, 'number'), parse.unit)

const getProperty = property => R.compose(Number, R.prop(property))
const getStyle = prop =>
  R.compose(String, R.prop(prop), n => getComputedStyle(n))

const getNodePropValue = prop => R.compose(getNumber, getStyle(prop))

const getNodeProperty = (name, prop, val) =>
  R.compose(
    R.ifElse(isHTMLElement, getNodePropValue(prop), R.always(val)),
    R.prop(name),
  )

const __default = (property, node, prop, val) =>
  R.ifElse(
    R.has(property),
    getProperty(property),
    R.ifElse(R.has(node), getNodeProperty(node, prop, val), R.always(val)),
  )

export const getViewportWidth: Default<Object> = R.propOr(vw, 'viewportWidth')

export const getViewportHeight: Default<Object> = R.propOr(vh, 'viewportHeight')

export const getViewportMin: Default<Object> = R.converge(R.min, [
  getViewportWidth,
  getViewportHeight,
])

export const getViewportMax: Default<Object> = R.converge(R.max, [
  getViewportWidth,
  getViewportHeight,
])

export const getRootFontSize: Default<Object> = __default(
  'rootFontSize',
  'root',
  'fontSize',
  16,
)

export const getRootLineHeight: Default<Object> = __default(
  'rootLineHeight',
  'root',
  'lineHeight',
  16,
)

export const getElementFontSize: Default<Object> = __default(
  'fontSize',
  'element',
  'fontSize',
  16,
)

export const getElementLineHeight: Default<Object> = __default(
  'lineHeight',
  'element',
  'lineHeight',
  16,
)

export const getElementSize: Default<Object> = __default(
  'size',
  'element',
  'width',
  vw,
)
