import { curry } from '../../utils'
import { Result, Success, Failure } from './result';


export default function from_throwable<A,B>(fn: (a: A) => B): (a: A) => Result<B,string>;
export default function from_throwable<A,B,C>(fn: (a: A, b: B) => C): (a: A, b: B) => Result<C,string>;
export default function from_throwable<A,B,C,D>(fn: (a: A, b: B, c: C) => D): (a: A, b: B, c: C) => Result<D,string>;
export default function from_throwable<A,B,C,D,E>(fn: (a: A, b: B, c: C, d: D) => E): (a: A, b: B, c: C, d: D) => Result<E,string>;
export default function from_throwable(fn: any): any {
  return curry(function(...args: Array<any>) {
    try {
      return new Success(fn(...args));
    } catch(e) {
      return new Failure(e.message);
    }
  });
}