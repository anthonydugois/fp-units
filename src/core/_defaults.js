// @flow

import type { Config } from '../types'

import R from 'ramda'
import { parse } from '../parse'

const isBrowser = R.always(typeof window !== 'undefined')
const vw = isBrowser() ? window.innerWidth : 0
const vh = isBrowser() ? window.innerHeight : 0

const isHTMLElement = el => R.and(isBrowser(), el instanceof HTMLElement)

const hasValidNode = property =>
  R.both(R.has(property), R.compose(isHTMLElement, R.prop(property)))

const getNodeProperty = (node, nodeProperty) =>
  R.compose(
    R.head,
    R.flatten,
    parse,
    R.prop(nodeProperty),
    isBrowser() ? window.getComputedStyle : R.identity,
    R.prop(node),
  )

// default factory
const _default = (property, node, nodeProperty, value) =>
  R.ifElse(
    R.has(property),
    R.prop(property),
    R.ifElse(
      hasValidNode(node),
      getNodeProperty(node, nodeProperty),
      R.always(value),
    ),
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

export const getRootFontSize: Default<Config> = _default(
  'rootFontSize',
  'root',
  'fontSize',
  16,
)

export const getRootLineHeight: Default<Config> = _default(
  'rootLineHeight',
  'root',
  'lineHeight',
  16,
)

export const getElementFontSize: Default<Config> = _default(
  'fontSize',
  'element',
  'fontSize',
  16,
)

export const getElementLineHeight: Default<Config> = _default(
  'lineHeight',
  'element',
  'lineHeight',
  16,
)

export const getElementSize: Default<Config> = _default(
  'size',
  'element',
  'width',
  vw,
)
