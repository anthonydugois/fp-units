# fp-units

An FP-oriented library to easily convert CSS units. Provides some convenient curried functions to parse and convert every CSS units available in the spec.

1. [Installation](#installation)
2. [Basic usage](#basic-usage)
3. [Supported units](#supported-units)
4. [API](#API)

## Installation

```
npm install --save fp-units
```

## Basic usage

### Absolut units

```js
import { to } from 'fp-units'

to('px', '100px 2cm 15mm 4q 4in 30pc 24pt')
// [100, 75.59055, 56.69291, 3.77953, 384, 480, 32]
```

### Relative units

```js
import { converter } from 'fp-units'

const to = converter({
 root: document.documentElement,
 element: document.querySelector('#foobar'),
})

to('px', '2rem 4em 2rlh 4lh 50% 25vw 40vh 5vmin 10vmax')
// [32, 96, 32, 104, 50, 480, 432, 54, 192]
```

## Supported units

**fp-units** supports conversions of every units described in the [CSS spec](https://www.w3.org/TR/css3-values/), as long as the starting unit and the arrival unit have the same nature. For example, it is possible to convert `px` to `%`, but it is impossible to convert `deg` to `px`, because `deg` describes an angle while `px` describes a length.

### Length

`px` (*canonical*), `cm`, `mm`, `q`, `in`, `pt`, `pc`, `%`, `em`, `rem`, `ex`, `ch`, `ic`, `lh`, `rlh`, `vw`, `vh`, `vmin`, `vmax`, `vb`, `vi`

### Angle

`rad` (*canonical*), `deg`, `grad`, `turn`

### Time

`s` (*canonical*), `ms`

### Frequency

`hz` (*canonical*), `khz`

### Resolution

`dppx` (*canonical*), `dpi`, `dpcm`

## API

## License

MIT
