// @flow

import R from 'ramda'
import * as is from './_is'
import * as selectors from './_selectors'
import convert from '../convert'

const ofHead = R.compose(R.of, R.head)

const calcLeftRight: (
  p: (o: Object) => boolean,
) => (c: Object, u: string) => (n: Object[]) => Object[] = predicate => (
  config,
  unit,
) => nodes =>
  R.tail(nodes).reduce((acc, node, index, nodes) => {
    const prev = R.defaultTo({}, R.last(acc))
    const next = nodes[index + 1]

    if (is.isNodeOperator(node)) {
      const op = selectors.getValue(node)
      const f = selectors.getOperator(op)

      if (op === '*') {
        if (!is.isNodeNumber(prev) && !is.isNodeNumber(next)) {
          throw new Error(
            `Invalid calc expression: at least one side of a multiplication should be a number.`,
          )
        }
      }

      if (op === '/') {
        if (!is.isNodeDimension(prev) && !is.isNodeNumber(prev)) {
          throw new Error(
            `Invalid calc expression: the left side of a division should be a dimension or a number.`,
          )
        }

        if (!is.isNodeNumber(next)) {
          throw new Error(
            `Invalid calc expression: the right side of a division should be a number.`,
          )
        }

        if (selectors.getValueNumber(next) === 0) {
          throw new Error(`Invalid calc expression: division by 0.`)
        }
      }

      const prevUnit = selectors.getUnitString(prev)
      const nextUnit = selectors.getUnitString(next)

      const canonicalPrevUnit = selectors.getCanonical(prevUnit)
      const canonicalNextUnit = selectors.getCanonical(nextUnit)

      if (!is.isNodeNumber(prev) && R.isNil(canonicalPrevUnit)) {
        throw new Error(
          `Invalid calc expression: Unknown unit: \`${prevUnit}\` is not handled.`,
        )
      }

      if (!is.isNodeNumber(next) && R.isNil(canonicalNextUnit)) {
        throw new Error(
          `Invalid calc expression: Unknown unit: \`${nextUnit}\` is not handled.`,
        )
      }

      if (
        !is.isNodeNumber(prev) &&
        !is.isNodeNumber(next) &&
        !R.equals(canonicalPrevUnit, canonicalNextUnit)
      ) {
        throw new Error(
          `Invalid calc expression: Incompatible units: calc operation between \`${prevUnit}\` and \`${nextUnit}\` cannot be performed.`,
        )
      }

      if (predicate(node)) {
        const _convertNode = convertNode(config, unit)
        const left = _convertNode(prev)
        const right = _convertNode(next)

        const value = String(f(left, right))
        const type = R.and(is.isNodeNumber(prev), is.isNodeNumber(next))
          ? 'Number'
          : 'Dimension'

        acc[acc.length - 1] = {
          type,
          value,
          ...(type === 'Dimension' ? { unit } : {}),
        }
      } else {
        acc.push(node, next)
      }
    }

    return acc
  }, ofHead(nodes))

const add: (c: Object, u: string) => (n: Object[]) => Object[] = calcLeftRight(
  is.isAdd,
)

const mult: (c: Object, u: string) => (n: Object[]) => Object[] = calcLeftRight(
  is.isMult,
)

const filterCalcNodes: (c: Object, u: string) => (n: Object[]) => Object[] = (
  config,
  unit,
) =>
  R.reduce((acc, node) => {
    if (is.isFunctionCalc(node)) {
      acc.push(calc(config, unit)(R.propOr([], 'children', node)))
    }

    if (is.isFunctionCalcConcerned(node)) {
      acc.push(node)
    }

    return acc
  }, [])

export const calc: (c: Object, u: string) => (n: Object[]) => Object = (
  config,
  unit,
) =>
  R.compose(
    R.defaultTo({}),
    R.head,
    add(config, unit),
    mult(config, unit),
    filterCalcNodes(config, unit),
  )

const convertNodeDimension: (c: Object, u: string) => (n: Object) => number = (
  config,
  unit,
) =>
  R.compose(
    Number,
    R.converge(convert(config, unit), [
      selectors.getUnitString,
      selectors.getValueNumber,
    ]),
  )

const convertNode: (c: Object, u: string) => (n: Object) => number = (
  config,
  unit,
) =>
  R.cond([
    [is.isNodeNumber, selectors.getValueNumber],
    [is.isNodeDimension, convertNodeDimension(config, unit)],
  ])
