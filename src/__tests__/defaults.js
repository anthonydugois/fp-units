import {
  getViewportWidth,
  getViewportHeight,
  getViewportMin,
  getViewportMax,
  getRootFontSize,
  getRootLineHeight,
  getElementFontSize,
  getElementLineHeight,
  getElementSize,
} from '../defaults'

test('should return viewport width', () => {
  expect(getViewportWidth({ viewportWidth: 1024 })).toBe(1024)
})

test('should return viewport height', () => {
  expect(getViewportHeight({ viewportHeight: 768 })).toBe(768)
})

test('should return viewport min', () => {
  expect(
    getViewportMin({
      viewportWidth: 1024,
      viewportHeight: 768,
    }),
  ).toBe(768)
})

test('should return viewport max', () => {
  expect(
    getViewportMax({
      viewportWidth: 1024,
      viewportHeight: 768,
    }),
  ).toBe(1024)
})

test('should return root font size', () => {
  document.documentElement.style.fontSize = '16px'

  expect(getRootFontSize({ rootFontSize: 24 })).toBe(24)
  expect(getRootFontSize({ root: document.documentElement })).toBe(16)
})

test('should return root line height', () => {
  document.documentElement.style.lineHeight = '16px'

  expect(getRootLineHeight({ rootLineHeight: 24 })).toBe(24)
  expect(getRootLineHeight({ root: document.documentElement })).toBe(16)
})

test('should return element size', () => {
  const element = document.createElement('div')

  element.style.width = '250px'

  expect(getElementSize({ size: 500 })).toBe(500)
  expect(getElementSize({ element })).toBe(250)
})

test('should return element font size', () => {
  const element = document.createElement('div')

  element.style.fontSize = '28px'

  expect(getElementFontSize({ fontSize: 18 })).toBe(18)
  expect(getElementFontSize({ element })).toBe(28)
})

test('should return element line height', () => {
  const element = document.createElement('div')

  element.style.lineHeight = '28px'

  expect(getElementLineHeight({ lineHeight: 18 })).toBe(18)
  expect(getElementLineHeight({ element })).toBe(28)
})
