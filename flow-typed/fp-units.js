type Convert<C, U, V> = (c: C) => (u: U) => (f: U) => (v: V) => number
type Converter<C, U, V> = (c: C) => (u: U) => (v: V) => Array<Array<number>>
type Default<C> = (c: C) => number
