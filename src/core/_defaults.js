// @flow

import type { Config } from '../types'

import R from 'ramda'
import { isWindow, isDocument, isHTMLElement } from './_is'
import { ast } from './_ast'

const __innerWidth = 0
const __innerHeight = 0
const __rootFontSize = 16
const __rootLineHeight = 16
const __nodeFontSize = 16
const __nodeLineHeight = 16
const __nodeSize = 0

export const getDefaultConfig: (c?: Object) => Config = (config = {}) => ({
  window: isWindow()
    ? window
    : {
        innerWidth: __innerWidth,
        innerHeight: __innerHeight,
      },
  document: isDocument()
    ? document
    : {
        lineHeight: 16,
        fontSize: 16,
      },
  node: {
    width: 0,
    lineHeight: 16,
    fontSize: 16,
  },
  property: 'width',
  ...config,
})

const getWindow: (c: Object) => Object = R.propOr({}, 'window')
const getNode: (c: Object) => Object = R.propOr({}, 'node')
const getDocument: (c: Object) => Object = R.propOr({}, 'document')
const getProperty: (c: Object) => string = R.propOr('', 'property')

const getRoot: (c: Object) => Object = R.compose(
  R.ifElse(
    R.has('documentElement'),
    R.propOr({}, 'documentElement'),
    R.identity,
  ),
  getDocument,
)

const getDimension: (a: Array<Array<Object>>) => Object = R.compose(
  R.defaultTo({}),
  R.head,
  R.flatten,
)

const getValue: (a: Array<Array<Object>>) => string = R.compose(
  R.propOr('', 'value'),
  getDimension,
)

const getNumber: (s: string) => number = R.compose(Number, getValue, ast)

const getProp: (p: string, n: HTMLElement) => string = (prop, node) =>
  R.compose(String, R.prop(prop), getComputedStyle)(node)

const getPropValue: (p: string) => (n: HTMLElement) => number = prop => node =>
  getNumber(getProp(prop, node))

const getNodeSizeByProp: (p: string, n: HTMLElement) => number = (prop, node) =>
  R.ifElse(isHTMLElement, getPropValue(prop), R.propOr(__nodeSize, prop))(node)

export const getViewportWidth: Default<Object> = R.compose(
  R.propOr(__innerWidth, 'innerWidth'),
  getWindow,
)

export const getViewportHeight: Default<Object> = R.compose(
  R.propOr(__innerHeight, 'innerHeight'),
  getWindow,
)

export const getViewportMin: Default<Object> = R.converge(R.min, [
  getViewportWidth,
  getViewportHeight,
])

export const getViewportMax: Default<Object> = R.converge(R.max, [
  getViewportWidth,
  getViewportHeight,
])

export const getRootFontSize: Default<Object> = R.compose(
  R.ifElse(
    isHTMLElement,
    getPropValue('fontSize'),
    R.propOr(__rootFontSize, 'fontSize'),
  ),
  getRoot,
)

export const getRootLineHeight: Default<Object> = R.compose(
  R.ifElse(
    isHTMLElement,
    getPropValue('lineHeight'),
    R.propOr(__rootLineHeight, 'lineHeight'),
  ),
  getRoot,
)

export const getNodeFontSize: Default<Object> = R.compose(
  R.ifElse(
    isHTMLElement,
    getPropValue('fontSize'),
    R.propOr(__nodeFontSize, 'fontSize'),
  ),
  getNode,
)

export const getNodeLineHeight: Default<Object> = R.compose(
  R.ifElse(
    isHTMLElement,
    getPropValue('lineHeight'),
    R.propOr(__nodeLineHeight, 'lineHeight'),
  ),
  getNode,
)

export const getNodeSize: Default<Object> = R.converge(getNodeSizeByProp, [
  getProperty,
  getNode,
])
