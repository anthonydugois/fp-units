import {
  getViewportWidth,
  getViewportHeight,
  getViewportMin,
  getViewportMax,
  getRootFontSize,
  getRootLineHeight,
  getNodeFontSize,
  getNodeLineHeight,
  getNodeSize,
} from '../_defaults'

test('should return viewport width', () => {
  expect(getViewportWidth({ window: window })).toBe(1024)
})

test('should return viewport height', () => {
  expect(getViewportHeight({ window: window })).toBe(768)
})

test('should return viewport min', () => {
  expect(getViewportMin({ window: window })).toBe(768)
})

test('should return viewport max', () => {
  expect(getViewportMax({ window: window })).toBe(1024)
})

test('should return root font size', () => {
  document.documentElement.style.fontSize = '16px'

  expect(getRootFontSize({ document: { fontSize: 24 } })).toBe(24)
  expect(getRootFontSize({ document: document })).toBe(16)
})

test('should return root line height', () => {
  document.documentElement.style.lineHeight = '16px'

  expect(getRootLineHeight({ document: { lineHeight: 24 } })).toBe(24)
  expect(getRootLineHeight({ document: document })).toBe(16)
})

test('should return node size', () => {
  const div = document.createElement('div')
  div.style.width = '250px'

  expect(getNodeSize({ node: { width: 500 }, property: 'width' })).toBe(500)
  expect(getNodeSize({ node: div, property: 'width' })).toBe(250)
})

test('should throw when trying to get node size based on unspecified property', () => {
  expect(() =>
    getNodeSize({
      node: { width: 500 },
      property: 'height',
    }),
  ).toThrow()
})

test('should return node font size', () => {
  const div = document.createElement('div')
  div.style.fontSize = '28px'

  expect(getNodeFontSize({ node: { fontSize: 18 } })).toBe(18)
  expect(getNodeFontSize({ node: div })).toBe(28)
})

test('should return node line height', () => {
  const div = document.createElement('div')
  div.style.lineHeight = '28px'

  expect(getNodeLineHeight({ node: { lineHeight: 18 } })).toBe(18)
  expect(getNodeLineHeight({ node: div })).toBe(28)
})
