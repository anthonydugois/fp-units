import { values } from '../_values'

test('should return an array of [value, unit] pairs in any case', () => {
  expect(values('42px 1337rem')).toEqual([[42, 'px'], [1337, 'rem']])
  expect(values(42)).toEqual([[42, '']])
  expect(values(['42px', '1337rem'])).toEqual([[42, 'px'], [1337, 'rem']])
  expect(values([42])).toEqual([[42, '']])
})
