import convert from '../convert'

test('should correctly convert a single absolute unit', () => {
  expect(convert({}, 'px', 'cm', 2)).toBeCloseTo(75.59055, 5)
  expect(convert({}, 'cm', 'px', 75.59055)).toBeCloseTo(2, 5)

  expect(convert({}, 'rad', 'deg', 180)).toBeCloseTo(Math.PI, 5)
  expect(convert({}, 'deg', 'rad', Math.PI)).toBeCloseTo(180, 5)
})

test('should correctly convert a single relative unit', () => {
  const cfg = {
    document: { fontSize: 16 },
    node: { width: 100 },
    property: 'width',
  }

  expect(convert(cfg, 'px', 'rem', 2)).toBeCloseTo(32, 5)
  expect(convert(cfg, 'rem', 'px', 32)).toBeCloseTo(2, 5)

  expect(convert(cfg, 'px', '%', 50)).toBeCloseTo(50, 5)
  expect(convert(cfg, '%', 'px', 50)).toBeCloseTo(50, 5)
})

test('should throw when trying to convert incompatible units', () => {
  expect(() => convert({}, 'rad', 'px', 100)).toThrow()
})

test('should throw when trying to convert from an unknown unit', () => {
  expect(() => convert({}, 'px', 'foo', 100)).toThrow()
})

test('should throw when trying to convert in an unknown unit', () => {
  expect(() => convert({}, 'foo', 'px', 100)).toThrow()
})
