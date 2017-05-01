// @flow

export const throwUnspecifiedProp: (p: string) => Function = prop => () => {
  throw new Error(
    `Unspecified property: no \`${prop}\` property found in the provided node config.`,
  )
}

export const throwUnknownUnit: (u: string) => void = unit => {
  throw new Error(`Unknown unit: \`${unit}\` is not handled.`)
}

export const throwIncompatibleUnits: (f: string, t: string) => void = (
  from,
  to,
) => {
  throw new Error(
    `Incompatible units: \`${from}\` cannot be converted to \`${to}\`.`,
  )
}

export const throwInvalidCalcMult: () => void = () => {
  throw new Error(
    `Invalid calc expression: at least one side of a multiplication should be a number.`,
  )
}

export const throwInvalidCalcDivLeft: () => void = () => {
  throw new Error(
    `Invalid calc expression: the left side of a division should be a dimension or a number.`,
  )
}

export const throwInvalidCalcDivRight: () => void = () => {
  throw new Error(
    `Invalid calc expression: the right side of a division should be a number.`,
  )
}

export const throwInvalidCalcDiv0: () => void = () => {
  throw new Error(`Invalid calc expression: division by 0.`)
}

export const throwInvalidCalcUnknownUnit: (u: string) => void = unit => {
  throw new Error(
    `Invalid calc expression: Unknown unit: \`${unit}\` is not handled.`,
  )
}

export const throwInvalidCalcIncompatibleUnits: (
  p: string,
  n: string,
) => void = (prev, next) => {
  throw new Error(
    `Invalid calc expression: Incompatible units: calc operation between \`${prev}\` and \`${next}\` cannot be performed.`,
  )
}
