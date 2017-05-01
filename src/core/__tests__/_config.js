import config from '../_config'

test('should return the default config', () => {
  expect(config()).toEqual({
    window: window,
    document: document,
    node: {
      width: 0,
      fontSize: 16,
      lineHeight: 16,
    },
    property: 'width',
  })

  expect(
    config({
      window: {
        innerWidth: 1024,
        innerHeight: 768,
      },
      document: {
        lineHeight: 24,
        fontSize: 24,
      },
      property: 'height',
    }),
  ).toEqual({
    window: {
      innerWidth: 1024,
      innerHeight: 768,
    },
    document: {
      lineHeight: 24,
      fontSize: 24,
    },
    node: {
      width: 0,
      fontSize: 16,
      lineHeight: 16,
    },
    property: 'height',
  })
})
