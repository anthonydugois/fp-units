type Parse = (s: string) => Array<Array<number | string>>
type To<U, V> = (u: U) => (v: V) => Array<number>
type Converter<T, U, V> = (c: T) => To<U, V>
type Default<T> = (c: T) => number
