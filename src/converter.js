// @flow

import type { Values } from './types'

import R from 'ramda'
import * as is from './core/_is'
import * as selectors from './core/_selectors'
import ast from './core/_ast'
import calc from './core/_calc'
import convert from './convert'

const convertNodes: (c: Object, u: string) => (n: Object[]) => number[] = (
  config,
  unit,
) => nodes =>
  R.reduce(
    (acc, node) => {
      if (is.isFunctionCalc(node)) {
        const _node = calc(config, unit)(R.propOr([], 'children', node))
        const from = selectors.getUnitString(_node)
        const value = selectors.getValueNumber(_node)

        acc.push(Number(convert(config, unit, from, value)))
      }

      if (
        R.anyPass([is.isNodeDimension, is.isNodeNumber, is.isNodePercentage])(
          node,
        )
      ) {
        const from = selectors.getUnitString(node)
        const value = selectors.getValueNumber(node)

        acc.push(Number(convert(config, unit, from, value)))
      }

      return acc
    },
    [],
    nodes,
  )

const converter: Converter<Object, string, Values> = (config, unit, values) =>
  R.map(convertNodes(config, unit), ast(values))

/**
 * Smartly converts the provided values into the desired unit. You can convert numbers, strings and calc expressions.
 *
 * Note: if the provided values don't have any unit, it will assume that they are expressed in the canonical unit corresponding to the nature of the desired unit (e.g. `px` if the desired unit is a length).
 * @param {Object} config The config object.
 * @param {string} unit The desired unit.
 * @param {string|number|Array<string|number>} values The values and units to convert.
 * @return {Array<Array<number>>}
 * @example
 * import { converter } from 'fp-units'
 *
 * const to = converter({
 *   node: document.querySelector('#foobar'),
 * })
 *
 * to('px', '30 2rem 4em 2rlh 4lh 50% 25vw 40vh 5vmin 10vmax')
 * // [[30, 32, 96, 32, 104, 50, 480, 432, 54, 192]]
 *
 * to('px', [30, '2rem 4px', '4em'])
 * // [[30], [32, 4], [96]]
 *
 * to('rem', 32)
 * // [[2]]
 *
 * to('rem', 'calc(2 * calc(12px + 4px))')
 * // [[2]]
 */
export default R.curryN(3, converter)
