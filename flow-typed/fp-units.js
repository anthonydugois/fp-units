type Nested = Array<Nested | number | string>

type Parse = (s: string) => Nested
type To<U, V> = (u: U) => (v: V) => Array<number>
type Converter<T, U, V> = (c: T) => To<U, V>
type Default<T> = (c: T) => number
