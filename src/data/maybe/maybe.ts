export type MaybeMapping<A,B> =
  (val: A) => B;


export type MaybePredicate<T> =
  (val: T) => boolean;


export interface Maybe<T> {
  _value: T;
  get(): T;
  getOrElse(val: T): T;
  fork(just: (val: T) => T, nothing: () => T): T;
  join<A>(this: Maybe<Maybe<A>>): Maybe<A>;
  ap<A,B>(this: Maybe<(val: A) => B>, maybe: Maybe<A>): Maybe<B>;
  map<A>(mapping: MaybeMapping<T,A>): Maybe<A>;
  chain<A>(mapping: (val: T) => Maybe<A>): Maybe<A>;
  filter(predicate: (val: T) => boolean): Maybe<T>;
  toString(): string;
  isNothing(): boolean;
  isJust(): boolean;
}


export class Just<T> implements Maybe<T> {
  _value: T;

  constructor(val: T) {
    this._value = val;
  }

  toString(): string {
    return `Just(${this._value})`;
  }

  /**
   * ap :: Maybe (a -> b) -> Maybe a -> Maybe b
   *
   * Applies the function in one maybe to the value of another.
   *
   * @name ap
   * @method
   * @memberof Frampton.Data.Maybe#
   * @param {Frampton.Data.Maybe} mb
   * @returns {Frampton.Data.Maybe}
   */
  ap<A,B>(this: Maybe<(val: A) => B>, maybe: Maybe<A>): Maybe<B> {
    const self: Maybe<(val: A) =>B> = this;
    if (maybe.isJust()) {
      return new Just<B>(self._value(maybe._value));
    } else {
      return new Nothing<B>();
    }
  }

  /**
   * join :: Maybe (Maybe a) -> Maybe a
   *
   * Takes a nested Maybe and removes one level of nesting.
   *
   * @name join
   * @method
   * @memberof Frampton.Data.Maybe#
   * @returns {Frampton.Data.Maybe}
   */
  join<A>(this: Maybe<Maybe<A>>): Maybe<A> {
    return this.get();
  }

  /**
   * @name fork
   * @method
   * @memberof Frampton.Data.Maybe#
   * @param {Function} justFn Function to call with value of Just
   * @param {Function} nothingFn Function to call with value of Nothing
   * @returns {*} The return value of the matching function
   */
  fork<B>(justFn: (val: T) => B, _: () => B): B {
    return justFn(this._value);
  }

  /**
   * map :: Maybe a -> (a -> b) -> Maybe b
   *
   * Transforms the value of a Maybe with the given function.
   *
   * @name map
   * @method
   * @memberof Frampton.Data.Maybe#
   * @param {Function} mapping Function used to map value of Maybe
   * @returns {Frampton.Data.Maybe}
   */
  map<B>(mapping: MaybeMapping<T,B>): Maybe<B> {
    return new Just<B>(mapping(this._value));
  }

  /**
   * chain :: Maybe a -> (a -> Maybe b) -> Maybe b
   *
   * Takes the value of a Maybe and gives it to a function that returns a new Maybe.
   *
   * @name chain
   * @method
   * @memberof Frampton.Data.Maybe#
   * @param {Function} mapping Function used to create new Maybe
   * @returns {Frampton.Data.Maybe}
   */
  chain<B>(mapping: (val: T) => Maybe<B>): Maybe<B> {
    return this.map(mapping).join();
  }

  /**
   * filter :: Maybe a -> (a -> Boolean) -> Maybe a
   *
   * Turns a Just into a Nothing if the predicate returns false
   *
   * @name filter
   * @method
   * @memberof Frampton.Data.Maybe#
   * @param {Function} predicate Function used to test value
   * @returns {Frampton.Data.Maybe}
   */
  filter(predicate: MaybePredicate<T>): Maybe<T> {
    if (predicate(this._value)) {
      return new Just<T>(this._value);
    } else {
      return new Nothing<T>();
    }
  }

  /**
   * get :: Maybe a -> a
   *
   * Extract the value from a Maybe
   *
   * @name get
   * @method
   * @memberof Frampton.Data.Maybe#
   * @returns {*}
   */
  get(): T {
    return this._value;
  }

  /**
   * getOrElse :: Maybe a -> a -> a
   *
   * @name getOrElse
   * @method
   * @memberof Frampton.Data.Maybe#
   * @returns {*}
   */
  getOrElse(_: T): T {
    return this._value;
  }

  /**
   * isNothing :: Maybe a -> Boolean
   *
   * @name isNothing
   * @method
   * @memberof Frampton.Data.Maybe#
   * @returns {Boolean}
   */
  isNothing(): boolean {
    return false;
  }

  /**
   * isJust :: Maybe a -> Boolean
   *
   * @name isJust
   * @method
   * @memberof Frampton.Data.Maybe#
   * @returns {Boolean}
   */
  isJust(): boolean {
    return false;
  }
}


export class Nothing<T> implements Maybe<T> {
  _value: T;

  constructor() {
    this._value = null;
  }

  toString(): string {
    return 'Nothing';
  }

  fork<B>(_: (val: T) => B, nothingFn: () => B): B {
    return nothingFn();
  }

  join(): Nothing<T> {
    return new Nothing<T>();
  }

  map<B>(_: MaybeMapping<T,B>): Nothing<B> {
    return new Nothing<B>();
  }

  filter(_: MaybePredicate<T>): Nothing<T> {
    return new Nothing<T>();
  }

  ap<A,B>(this: Maybe<(val: A) =>B>, _: Maybe<A>): Nothing<B> {
    return new Nothing<B>();
  }

  chain<B>(_: (val: T) => Maybe<B>): Nothing<B> {
    return new Nothing<B>();
  }

  get(): T {
    throw new Error('Cannot get the value of a Nothing');
  }

  getOrElse(val: T): T {
    return val;
  }

  isJust(): boolean {
    return false;
  }

  isNothing(): boolean {
    return true;
  }
}