import { curry } from '../../utils';


// export interface ResultClient<V,E> {
//   toString(): string;
//   map<B>(mapping: (value: V) => B): ResultClient<B,E>;
//   mapFailure<B>(mapping: (err: E) => B): ResultClient<V,B>;
//   filter(predicate: (value: V) => boolean): ResultClient<V,E>;
//   fork<A,B>(success: (value: V) => A, failure: (err: E) => B): A | B;
//   isFailure(): boolean;
//   isSuccess(): boolean;
// }


export class Result<V,E> {
  protected _value: V;

  static fromThrowable<A,B>(fn: (a: A) => B): (a: A) => Result<B,string>;
  static fromThrowable<A,B,C>(fn: (a: A, b: B) => C): (a: A, b: B) => Result<C,string>;
  static fromThrowable<A,B,C,D>(fn: (a: A, b: B, c: C) => D): (a: A, b: B, c: C) => Result<D,string>;
  static fromThrowable<A,B,C,D,E>(fn: (a: A, b: B, c: C, d: D) => E): (a: A, b: B, c: C, d: D) => Result<E,string>;
  static fromThrowable(fn: any): any {
    return curry(function(...args: Array<any>) {
      try {
        return new Success(fn(...args));
      } catch(e) {
        return new Failure(e.message);
      }
    });
  }

  static success<T>(val: T): Success<T> {
    return new Success(val);
  }

  static failure<T>(val: T): Failure<T> {
    return new Failure(val);
  }

  toString(): string {
    return `Success(${this._value})`;
  }

  map<B>(mapping: (val: V) => B): Success<B> {
    return new Success(mapping(this._value));
  }

  mapFailure<B>(mapping: (err: any) => B): Success<V> {
    return new Success(this._value);
  }

  filter(predicate: (val: V) => boolean): Result<V,V> {
    if (predicate(this._value)) {
      return new Success(this._value);
    } else {
      return new Failure(this._value);
    }
  }

  fork<A,B>(success: (value: V) => A, _: (err: any) => B): A {
    return success(this._value);
  }

  isFailure(): boolean {
    return false;
  }

  isSuccess(): boolean {
    return true;
  }
}


export class Success<T> extends Result<T,never> {
  _value: T;

  constructor(val: T) {
    super();
    this._value = val;
  }
}


export class Failure<T> extends Result<any,T> {
  _value: T;

  constructor(val: T) {
    super();
    this._value = val;
  }

  toString(): string {
    return `Failure(${this._value})`;
  }

  map<B>(mapping: (value: any) => B): Failure<T> {
    return new Failure(this._value);
  }

  mapFailure<B>(mapping: (err: T) => B): Failure<B> {
    return new Failure(mapping(this._value));
  }

  filter(predicate: (value: any) => boolean): Failure<T> {
    return new Failure(this._value);
  }

  fork<A,B>(_: (value: any) => A, failure: (err: T) => B): B {
    return failure(this._value);
  }

  isFailure(): boolean {
    return true;
  }

  isSuccess(): boolean {
    return false;
  }
}