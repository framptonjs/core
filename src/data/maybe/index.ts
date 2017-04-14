import { Just, Nothing, Maybe } from './maybe';


export { Just, Nothing, Maybe } from './maybe';


export function nothing<T>(): Nothing<T> {
  return new Nothing<T>();
}


export function just<T>(val: T): Just<T> {
  return new Just<T>(val);
}


export function fromNullable<T>(val: T): Maybe<T> {
  if (val === null || val === undefined) {
    return new Nothing<T>();
  } else {
    return new Just<T>(val);
  }
}