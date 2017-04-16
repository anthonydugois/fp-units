import { parse } from '../parse'

test('should parse the string and return a list of [value, unit] pairs', () => {
  expect(parse('100px 50%')).toEqual([[100, 'px'], [50, '%']])
  expect(parse('5.025e-2em')).toEqual([[5.025e-2, 'em']])
  expect(parse('10')).toEqual([[10, '']])
})
