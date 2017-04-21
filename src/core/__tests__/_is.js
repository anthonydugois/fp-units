import { isString, isNumber, isArray } from '../_is'

test('should correctly detect a string', () => {
  expect(isString('foo')).toBe(true)
  expect(isString(42)).toBe(false)
  expect(isString(['foo'])).toBe(false)
})

test('should correctly detect a number', () => {
  expect(isNumber(42)).toBe(true)
  expect(isNumber('foo')).toBe(false)
  expect(isNumber([42])).toBe(false)
})

test('should correctly detect an array', () => {
  expect(isArray(['foo'])).toBe(true)
  expect(isArray('foo')).toBe(false)
  expect(isArray(42)).toBe(false)
})
