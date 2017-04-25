import { values } from '../_values'

test('should return an array of [value, unit] pairs or calc expressions in any case', () => {
  expect(values('42px 2rem')).toEqual([[42, 'px'], [2, 'rem']])

  expect(values('42px calc(2rem + 3px)')).toEqual([
    [42, 'px'],
    [[2, 'rem'], '+', [3, 'px']],
  ])

  expect(values(42)).toEqual([[42, '']])

  expect(values(['42px', 'calc(2rem + 3px / calc(42px + -3px))'])).toEqual([
    [42, 'px'],
    [[2, 'rem'], '+', [3, 'px'], '/', [[42, 'px'], '+', [-3, 'px']]],
  ])

  expect(values([42])).toEqual([[42, '']])
})
