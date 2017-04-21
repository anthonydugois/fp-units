// @flow

export type Config = {
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

export type Units =
  | 'px'
  | 'cm'
  | 'mm'
  | 'q'
  | 'in'
  | 'pc'
  | 'pt'
  | 'rem'
  | 'em'
  | 'rlh'
  | 'lh'
  | '%'
  | 'vw'
  | 'vh'
  | 'vmin'
  | 'vmax'
  | 'rad'
  | 'deg'
  | 'grad'
  | 'turn'
  | 's'
  | 'ms'
  | 'hz'
  | 'khz'
  | 'dppx'
  | 'dpi'
  | 'dpcm'

export type Values = string | number | Array<string | number>
