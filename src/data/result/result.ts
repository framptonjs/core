export interface Result<V,E> {
  toString(): string;
  map<B>(mapping: (value: V) => B): Result<B,E>;
  mapFailure<B>(mapping: (err: E) => B): Result<V,B>;
  filter(predicate: (value: V) => boolean): Result<V,E>;
  fork<A, B>(success: (value: V) => A, failure: (err: E) => B): A | B;
  isFailure(): boolean;
  isSuccess(): boolean;
}


export class Success<T> implements Result<T,never> {
  _value: T;

  constructor(val: T) {
    this._value = val;
  }

  toString(): string {
    return `Success(${this._value})`;
  }

  map<B>(mapping: (val: T) => B): Success<B> {
    return new Success(mapping(this._value));
  }

  mapFailure<B>(mapping: (err: any) => B): Success<T> {
    return new Success(this._value);
  }

  filter(predicate: (val: T) => boolean): Result<T,T> {
    if (predicate(this._value)) {
      return new Success(this._value);
    } else {
      return new Failure(this._value);
    }
  }

  fork<A, B>(success: (value: T) => A, _: (err: any) => B): A {
    return success(this._value);
  }

  isFailure(): boolean {
    return false;
  }

  isSuccess(): boolean {
    return true;
  }
}


export class Failure<T> implements Result<any,T> {
  _value: T;

  constructor(val: T) {
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

  fork<A, B>(_: (value: any) => A, failure: (err: T) => B): B {
    return failure(this._value);
  }

  isFailure(): boolean {
    return true;
  }

  isSuccess(): boolean {
    return false;
  }
}