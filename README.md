# fp-units

An FP-oriented library to easily convert CSS units. Provides some convenient curried functions to parse and convert every CSS units available in the spec.

[![Build Status](https://travis-ci.org/anthonydugois/fp-units.svg?branch=master)](https://travis-ci.org/anthonydugois/fp-units)

1.  [Installation](#installation)
2.  [Basic usage](#basic-usage)
3.  [Supported units](#supported-units)
4.  [API](#api)

## Installation

    npm install --save fp-units

## Basic usage

### Absolut units

```js
import { to } from 'fp-units'

to('px', '100px 2cm 15mm 4q 4in 30pc 24pt')
// [100, 75.59055, 56.69291, 3.77953, 384, 480, 32]
```

### Relative units

In order to be able to do conversions between relative units, **fp-units** needs to know some values to perform calculus. For example, to convert `px` into `%`, you have to provide a fixed size to let **fp-units** know on what constant coefficient it should base the converter. In a browser environment, **fp-units** is able to guess the majority of the configuration object by itself: in most cases, you'll just have to provide the `root` and the `element` properties.

```js
import { converter } from 'fp-units'

const config = {
  viewportWidth: window.innerWidth, // width of the viewport (vw, vmin, vmax)
  viewportHeight: window.innerHeight, // height of the viewport (vh, vmin, vmax)
  root: document.documentElement, // the root element (rem, rlh)
  element: document.querySelector('#foobar'), // the element (em, lh, %)
  rootFontSize: 16, // a custom root font size, overrides the font-size value of the root element (rem)
  rootLineHeight: 16, // a custom root line height, overrides the line-height value of the root element (rlh)
  fontSize: 16, // a custom font size, overrides the font-size value of the element (em)
  lineHeight: 16, // a custom line height, overrides the line-height value of the element (lh)
  size: 200, // a custom size, overrides the width value of the element (%)
}

converter(config, 'px', '2rem 4em 2rlh 4lh 50% 25vw 40vh 5vmin 10vmax')
// [32, 96, 32, 104, 50, 480, 432, 54, 192]
```

**Note**: since all the provided functions are automatically curried, you can create a custom `to` function based on your own configuration:

```js
import { converter } from 'fp-units'

const to = converter({ /* your config */ })

to('px', '5rem')
to('%', '30vw')
to('vmin', '50% 40px')
```

## Supported units

**fp-units** supports conversions of every units described in the [CSS spec](https://www.w3.org/TR/css3-values/), as long as the starting unit and the arrival unit have the same nature. For example, it is possible to convert `px` to `%`, but it is impossible to convert `deg` to `px`, because `deg` describes an angle while `px` describes a length.

### Length

`px` (_canonical_), `cm`, `mm`, `q`, `in`, `pt`, `pc`, `%`, `em`, `rem`, `ex`, `ch`, `ic`, `lh`, `rlh`, `vw`, `vh`, `vmin`, `vmax`, `vb`, `vi`

### Angle

`rad` (_canonical_), `deg`, `grad`, `turn`

### Time

`s` (_canonical_), `ms`

### Frequency

`hz` (_canonical_), `khz`

### Resolution

`dppx` (_canonical_), `dpi`, `dpcm`

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### parse

Parses a string and returns a list of [value, unit] pairs.

Type: Parse

**Parameters**

-   `str` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The string to parse.

**Examples**

```javascript
import { parse } from 'fp-units'

parse('1px 3.054e-2em 50% 10')
// [[1, 'px'], [3.054e-2, 'em'], [50, '%'], [10, '']]
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number))>>**

### converter

Creates a conversion function. The config allows you to adjust the parameters used to make conversions of relative units like rem or %.

Type: Converter

**Parameters**

-   `config` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The config object.
-   `unit` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The desired unit.
-   `str` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A string of values and units to convert.

**Examples**

```javascript
import { converter } from 'fp-units'

const to = converter({
  root: document.documentElement,
  element: document.querySelector('#foobar'),
})

to('px', '2rem 4em 2rlh 4lh 50% 25vw 40vh 5vmin 10vmax')
// [32, 96, 32, 104, 50, 480, 432, 54, 192]
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>**

### to

Converts CSS units. This function is a shortcut to bypass config (convenient if you don't need to convert relative units).

Type: To

**Parameters**

-   `unit` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The desired unit.
-   `str` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A string of values and units to convert.

**Examples**

```javascript
import { to } from 'fp-units'

to('px', '100px 2cm 15mm 4q 4in 30pc 24pt')
// [100, 75.59055, 56.69291, 3.77953, 384, 480, 32]
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>**

## License

MIT
