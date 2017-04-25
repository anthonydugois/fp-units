import { parse } from '../parse'

test('should parse the string and return a list of [value, unit] pairs or calc expressions', () => {
  expect(parse('100px 50%')).toEqual([[100, 'px'], [50, '%']])

  expect(parse('5.025e-2em')).toEqual([[5.025e-2, 'em']])

  expect(parse('42px calc(2rem + -6px * calc(5px / 6))')).toEqual([
    [42, 'px'],
    [[2, 'rem'], '+', [-6, 'px'], '*', [[5, 'px'], '/', [6, '']]],
  ])

  expect(parse('10')).toEqual([[10, '']])
})
