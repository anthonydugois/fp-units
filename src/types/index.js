// @flow

type Config = {
  root?: HTMLElement,
  element?: HTMLElement,
  viewportWidth?: number,
  viewportHeight?: number,
  rootFontSize?: number,
  rootLineHeight?: number,
  size?: number,
  fontSize?: number,
  lineHeight?: number,
}

export type Parse = (s: string) => [number, string][]
export type To = (u: string) => (s: string) => number[]
export type Converter = (c: Config) => To
export type Default = (c: Config) => number
