type Convert<C, U, V> = (c: C, u: U, f: U, v: V) => number

type Converter<C, U, V> = (c: C, u: U, v: V) => number[][]

type Default<C> = (c: C) => number

type ConvF<C> = (c: C, f: (a: any) => number) => (n: number) => number
