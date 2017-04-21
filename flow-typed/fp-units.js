type Parse = (s: string) => [number, string][]
type To<V> = (u: string) => (v: V) => number[]
type Converter<T, V> = (c: T) => To<V>
type Default<T> = (c: T) => number
