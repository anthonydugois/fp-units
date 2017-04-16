import { converter, to } from '../to'

test('should correctly convert absolut lengths to px', () => {
  const [px, cm, mm, q, _in, pc, pt] = to(
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

test('should correctly convert relative lengths to px', () => {
  const [rem, em, rlh, lh, per, vw, vh, vmin, vmax] = converter(
    {
      viewportWidth: 1920,
      viewportHeight: 1080,
      rootFontSize: 16,
      rootLineHeight: 16,
      size: 100,
      fontSize: 24,
      lineHeight: 26,
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

test('should correctly convert relative lengths based on DOM nodes', () => {
  const root = document.documentElement
  const element = document.createElement('div')

  root.style.fontSize = '16px'
  root.style.lineHeight = '16px'

  element.style.width = '100px'
  element.style.fontSize = '24px'
  element.style.lineHeight = '26px'

  const [rem, em, rlh, lh, per, vw, vh, vmin, vmax] = converter(
    { root, element },
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

test('should correctly convert into any unit', () => {
  const [cm, px] = to('mm', '4cm 50px')

  expect(cm).toBeCloseTo(40, 5)
  expect(px).toBeCloseTo(13.22917, 5)
})

test('should correctly convert absolut angles to rad', () => {
  const [rad, deg, grad, turn] = to('rad', '1rad 180deg 100grad 0.25turn')

  expect(rad).toBeCloseTo(1, 5)
  expect(deg).toBeCloseTo(3.14159, 5)
  expect(grad).toBeCloseTo(1.5708, 5)
  expect(turn).toBeCloseTo(1.5708, 5)
})

test('should throw when trying to convert incompatible units', () => {
  expect(() => to('rad', '100px')).toThrow()
})
