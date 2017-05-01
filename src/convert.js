// @flow

import R from 'ramda'
import config from './core/_config'
import { getCanonical, getConverter } from './core/_selectors'

const convert: Convert<Object, string, number> = (
  _cfg,
  _unit,
  _from,
  _value,
) => {
  const cfg = config(_cfg)
  const canonicalUnit = getCanonical(_unit)

  if (R.isNil(canonicalUnit)) {
    throw new Error(`Unknown unit: \`${_unit}\` is not handled.`)
  }

  const from = R.when(R.isEmpty, R.always(String(canonicalUnit)))(_from)
  const canonicalFrom = getCanonical(from)

  if (R.isNil(canonicalFrom)) {
    throw new Error(`Unknown unit: \`${from}\` is not handled.`)
  }

  if (!R.equals(canonicalUnit, canonicalFrom)) {
    throw new Error(
      `Incompatible units: \`${from}\` cannot be converted to \`${_unit}\`.`,
    )
  }

  return R.compose(
    getConverter(_unit)(cfg, R.identity),
    getConverter(from)(cfg, R.divide(1)),
  )(_value)
}

/**
 * Naively converts a numeric value into the desired unit. This function is more granular than `converter`, but it does not handle automatic parsing, calc expressions and multiple conversions. This function is more useful when you need specialized converters.
 *
 * The config object allows you to adjust some parameters used to perform relative units conversions (e.g. `rem` or `%`).
 * @param {Object} config The config object.
 * @param {string} unit The desired unit.
 * @param {string} from The base unit.
 * @param {number} value The value to convert.
 * @return {number}
 * @example
 * import { convert } from 'fp-units'
 *
 * convert({}, 'rem', 'px', 32)
 * // 2
 *
 * convert({}, 'deg', 'rad', Math.PI)
 * // 180
 *
 * // Note: you can take advantage of automatic currying to have your own conversion API!
 * const rad2deg = convert({}, 'deg', 'rad')
 *
 * rad2deg(Math.PI)
 * // 180
 *
 * rad2deg(Math.PI / 4)
 * // 45
 */
export default R.curryN(4, convert)
