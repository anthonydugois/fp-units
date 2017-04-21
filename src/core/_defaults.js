// @flow

import type { Config } from '../types'

import R from 'ramda'
import { isBrowser, isHTMLElement } from './_is'
import { parse } from '../parse'

const vw = isBrowser() ? window.innerWidth : 0
const vh = isBrowser() ? window.innerHeight : 0
const getHead = R.compose(R.head, R.flatten)

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

const _getProperty = property => config => Number(R.prop(property, config))

const _getNodePropertyValue = (prop, node) =>
  R.compose(Number, getHead, parse, String, R.prop(prop), getComputedStyle)(
    node,
  )

const _getNodeProperty = (name, prop, val) => config =>
  R.ifElse(
    node => node instanceof HTMLElement,
    node => _getNodePropertyValue(prop, node),
    R.always(val),
  )(R.prop(name, config))

const __default = (property, node, prop, val) =>
  R.ifElse(
    R.has(property),
    _getProperty(property),
    R.ifElse(R.has(node), _getNodeProperty(node, prop, val), R.always(val)),
  )

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
