export function processOneOrArray<T, R>(data: T, callback: (item: T) => R): R
export function processOneOrArray<T, R>(
  data: T[],
  callback: (item: T) => R
): R[]
export function processOneOrArray<T, R>(
  data: T | T[],
  callback: (item: T) => R
): R | R[] {
  if (data instanceof Array) {
    return data.map(callback)
  } else {
    return callback(data)
  }
}
