// @flow

export type Config = {
  window: EventTarget | { [string]: number },
  document: Document | { [string]: number },
  node: HTMLElement | { [string]: number },
  property: string,
}

export type Values = string | number | (string | number)[]
