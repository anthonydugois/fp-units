// @flow

import type { Config } from '../types'

import R from 'ramda'
import { isBrowser, isHTMLElement } from './_is'
import { parse } from '../parse'

const vw = isBrowser() ? window.innerWidth : 0
const vh = isBrowser() ? window.innerHeight : 0
const flatHead = R.compose(R.head, R.flatten)

const getProperty = property => R.compose(Number, R.prop(property))
const getStyle = prop => R.compose(String, R.prop(prop), getComputedStyle)

const getNodePropValue = prop =>
  R.compose(Number, flatHead, parse, getStyle(prop))

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

export const getViewportWidth: Default<Config> = R.propOr(vw, 'viewportWidth')

export const getViewportHeight: Default<Config> = R.propOr(vh, 'viewportHeight')

export const getViewportMin: Default<Config> = R.converge(R.min, [
  getViewportWidth,
  getViewportHeight,
])

export const getViewportMax: Default<Config> = R.converge(R.max, [
  getViewportWidth,
  getViewportHeight,
])

export const getRootFontSize: Default<Config> = __default(
  'rootFontSize',
  'root',
  'fontSize',
  16,
)

export const getRootLineHeight: Default<Config> = __default(
  'rootLineHeight',
  'root',
  'lineHeight',
  16,
)

export const getElementFontSize: Default<Config> = __default(
  'fontSize',
  'element',
  'fontSize',
  16,
)

export const getElementLineHeight: Default<Config> = __default(
  'lineHeight',
  'element',
  'lineHeight',
  16,
)

export const getElementSize: Default<Config> = __default(
  'size',
  'element',
  'width',
  vw,
)
