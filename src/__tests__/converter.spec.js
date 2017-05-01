import converter from '../converter'

test('should correctly convert absolute units', () => {
  const [[px, cm, mm, q, _in, pc, pt]] = converter(
    {},
    'px',
    '100px 2cm 15mm 4q 4in 30pc 24pt',
  )

  expect(px).toBeCloseTo(100, 5)
  expect(cm).toBeCloseTo(75.59055, 5)
  expect(mm).toBeCloseTo(56.69291, 5)
  expect(q).toBeCloseTo(3.77953, 5)
  expect(_in).toBeCloseTo(384, 5)
  expect(pc).toBeCloseTo(480, 5)
  expect(pt).toBeCloseTo(32, 5)
})

test('should correctly convert relative units', () => {
  const [[rem, em, rlh, lh, per, vw, vh, vmin, vmax]] = converter(
    {
      window: { innerWidth: 1920, innerHeight: 1080 },
      document: { lineHeight: 16, fontSize: 16 },
      node: { width: 100, lineHeight: 26, fontSize: 24 },
      property: 'width',
    },
    'px',
    '2rem 4em 2rlh 4lh 50% 25vw 40vh 5vmin 10vmax',
  )

  expect(rem).toBeCloseTo(32, 5)
  expect(em).toBeCloseTo(96, 5)
  expect(rlh).toBeCloseTo(32, 5)
  expect(lh).toBeCloseTo(104, 5)
  expect(per).toBeCloseTo(50, 5)
  expect(vw).toBeCloseTo(480, 5)
  expect(vh).toBeCloseTo(432, 5)
  expect(vmin).toBeCloseTo(54, 5)
  expect(vmax).toBeCloseTo(192, 5)
})

test('should correctly convert relative units based on DOM nodes', () => {
  const node = document.createElement('div')

  document.documentElement.style.fontSize = '16px'
  document.documentElement.style.lineHeight = '16px'

  node.style.width = '100px'
  node.style.fontSize = '24px'
  node.style.lineHeight = '26px'

  const [[rem, em, rlh, lh, per, vw, vh, vmin, vmax]] = converter(
    { window: window, document: document, node: node },
    'px',
    '2rem 4em 2rlh 4lh 50% 25vw 40vh 5vmin 10vmax',
  )

  expect(rem).toBeCloseTo(32, 5)
  expect(em).toBeCloseTo(96, 5)
  expect(rlh).toBeCloseTo(32, 5)
  expect(lh).toBeCloseTo(104, 5)
  expect(per).toBeCloseTo(50, 5)
  expect(vw).toBeCloseTo(256, 5)
  expect(vh).toBeCloseTo(307.2, 5)
  expect(vmin).toBeCloseTo(38.4, 5)
  expect(vmax).toBeCloseTo(102.4, 5)
})

test('should handle string, number and array', () => {
  expect(converter({}, 'px', '2rem')).toEqual([[32]])
  expect(converter({}, 'px', 50)).toEqual([[50]])
  expect(converter({}, 'px', [50, '2rem'])).toEqual([[50], [32]])
  expect(converter({}, 'px', [50, '2rem 4rem'])).toEqual([[50], [32, 64]])
})

test('should handle calc expressions', () => {
  expect(converter({}, 'px', 'calc(20px + 30px)')).toEqual([[50]])
  expect(converter({}, 'px', 'calc(20px * 2)')).toEqual([[40]])
  expect(converter({}, 'px', 'calc(20px * calc(4 * 2))')).toEqual([[160]])
  expect(converter({}, 'px', 'calc(20px + 30px * 2)')).toEqual([[80]])
  expect(converter({}, 'px', 'calc(20px + 30px / 2)')).toEqual([[35]])
  expect(converter({}, 'px', 'calc(5 * 4)')).toEqual([[20]])
})

test('should throw when trying to calc unknown units', () => {
  expect(() => converter({}, 'px', 'calc(2foo + 1px)')).toThrow()
  expect(() => converter({}, 'px', 'calc(1px * 2foo)')).toThrow()
})

test('should throw when trying to calc incompatible units', () => {
  expect(() => converter({}, 'px', 'calc(2deg + 1px)')).toThrow()
})

test('should throw when trying to multiply a dimension by another dimension', () => {
  expect(() => converter({}, 'px', 'calc(2rem * 2px)')).toThrow()
})

test('should throw when trying to divide by a dimension', () => {
  expect(() => converter({}, 'px', 'calc(2rem / 2px)')).toThrow()
})

test('should throw when trying to divide by 0', () => {
  expect(() => converter({}, 'px', 'calc(2rem / 0)')).toThrow()
})
