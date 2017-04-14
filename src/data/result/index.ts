import { Success, Failure } from './result';


export { default as fromThrowable } from './from-throwable';


export function failure<T>(val: T): Failure<T> {
  return new Failure(val);
}


export function success<T>(val: T): Success<T> {
  return new Success(val);
}