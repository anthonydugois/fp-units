// @flow

import R from 'ramda'
import { isHTMLElement } from './_is'
import { ast } from './_ast'
import { conv } from './_conv'

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

const getDimension: (a: Object[][]) => Object = R.compose(
  R.defaultTo({}),
  R.head,
  R.flatten,
)

const getValue: (a: Object[][]) => string = R.compose(
  R.propOr('', 'value'),
  getDimension,
)

const getNumber: (s: string) => number = R.compose(Number, getValue, ast)

const getProp: (p: string, n: HTMLElement) => string = (prop, node) =>
  R.compose(String, R.prop(prop), getComputedStyle)(node)

const getPropValue: (p: string) => (n: HTMLElement) => number = prop => node =>
  getNumber(getProp(prop, node))

const throwUnspecifiedProp: (p: string) => Function = prop => () => {
  throw new Error(
    `Unspecified property: no \`${prop}\` property found in the provided node config.`,
  )
}

const retrieveProp: (p: string) => (n: Object) => number = prop =>
  R.ifElse(R.has(prop), R.propOr(16, prop), throwUnspecifiedProp(prop))

const getNodeSizeByProp: (p: string, n: HTMLElement) => number = (prop, node) =>
  R.ifElse(isHTMLElement, getPropValue(prop), retrieveProp(prop))(node)

export const getViewportWidth: Default<Object> = R.compose(
  R.propOr(0, 'innerWidth'),
  getWindow,
)

export const getViewportHeight: Default<Object> = R.compose(
  R.propOr(0, 'innerHeight'),
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
  R.ifElse(isHTMLElement, getPropValue('fontSize'), R.propOr(16, 'fontSize')),
  getRoot,
)

export const getRootLineHeight: Default<Object> = R.compose(
  R.ifElse(
    isHTMLElement,
    getPropValue('lineHeight'),
    R.propOr(16, 'lineHeight'),
  ),
  getRoot,
)

export const getNodeFontSize: Default<Object> = R.compose(
  R.ifElse(isHTMLElement, getPropValue('fontSize'), R.propOr(16, 'fontSize')),
  getNode,
)

export const getNodeLineHeight: Default<Object> = R.compose(
  R.ifElse(
    isHTMLElement,
    getPropValue('lineHeight'),
    R.propOr(16, 'lineHeight'),
  ),
  getNode,
)

export const getNodeSize: Default<Object> = R.converge(getNodeSizeByProp, [
  getProperty,
  getNode,
])
