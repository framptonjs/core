import { log } from '../../logging';
import { push } from './runtime';
import { curry, Curried2Result } from '../../utils';


export function emptyUpdate<T>(sig: Signal<T>): void {}


/**
 * @name mergeMany
 * @memberof Frampton.Signal
 * @method
 * @param {Frampton.Signal.Signal[]} parents - Signals to merge
 */
export function merge<T>(...parents: Array<Signal<T>>): Signal<T> {
  const initial = ((parents.length > 0) ? parents[0].value : undefined);

  return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
    sink(self._lastUpdater.value);
  }, parents, initial);
}


export type ValueSink<T> =
  (val: T) => void;


export interface SignalUpdater<T> {
  (sig: Signal<T>, sink: ValueSink<T>): void;
}


export type SignalMapping<A,B> =
  ((val: A) => B) |
  B;


export type SignalPredicate<T> =
  ((val: T) => boolean) |
  T;


export type SignalReducer<A,B> =
  (acc: B, next: A) => B;


export class Signal<T> {
  _update: SignalUpdater<T>;
  _lastUpdater: Signal<any>;
  _isQueued: boolean;
  value: T;
  parents: Array<Signal<any>>;
  children: Array<Signal<any>>;
  hasValue: boolean;

  static create<T>(initial?: T): Signal<T> {
    return new Signal<T>(null, [], initial);
  }

  static push = curry(<B>(sig: Signal<B>, val: B): void => {
    push(sig, val);
  })

  constructor(update: SignalUpdater<T>, parents: Array<Signal<any>>, initial: T) {
    // Public
    this.value = initial;
    this.parents = (parents || []);
    this.children = [];
    this.hasValue = (initial !== undefined);

    // Private
    this._isQueued = false;
    this._lastUpdater = null;
    this._update = (
      typeof update === 'function' ?
        update :
        emptyUpdate
    );

    for (let i = 0; i < parents.length; i++) {
      parents[i].children.push(this);
    }
  }

  toString(): string {
    return `Signal(${this.value})`;
  }

  push(val: T): void {
    push(this, val);
  }

  get(): T {
    return this.value;
  }

  /**
   * Calls the given function when this Signal has a value. The function is called immediately
   * if this Signal already has a value, then is called again each time this Signal updates.
   *
   * @name onValue
   * @method
   * @memberof Frampton.Signal.Signal#
   * @param {Function} fn - The function to call
   * @returns {Frampton.Signal.Signal}
   */
  onValue(fn: ValueSink<T>): Signal<T> {
    const parent: Signal<T> = this;
    const child: Signal<T> =
      new Signal((self: Signal<T>, sink: ValueSink<T>) => {
        fn(parent.value);
      }, [ parent ], parent.value);

    // Update immediately if it has a value
    if (child.hasValue) {
      fn(child.value);
    }

    return child;
  }

  /**
   * Works just like the value method, just repeated values are dropped.
   *
   * @name onChange
   * @method
   * @memberof Frampton.Signal.Signal#
   * @param {Function} fn - The function to call
   * @returns {Frampton.Signal.Signal}
   */
  onChange(fn: ValueSink<T>): Signal<T> {
    return this.dropRepeats().onValue(fn);
  }

  /**
   * Calls the given function when this signal updates. This function will call for the first
   * time the next time the Signal updates. If there is a current value on the Signal it is
   * ignored. If you are interested in the current value of the Signal use either the value or
   * changes method.
   *
   * @name onNext
   * @method
   * @memberof Frampton.Signal.Signal#
   * @param {Function} fn - The function to call
   * @returns {Frampton.Signal.Signal}
   */
  onNext(fn: ValueSink<T>): Signal<T> {
    const parent: Signal<T> = this;
    return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
      fn(parent.value);
    }, [ parent ], undefined);
  }

  /**
   * Removes the Signal from the Signal graph.
   *
   * @name close
   * @method
   * @memberof Frampton.Signal.Signal#
   */
  close(): void {
    const sig: Signal<T> = this;
    const childLen: number = sig.children.length;
    const parentLen: number = sig.parents.length;

    for (let i = 0; i < childLen; i++) {
      const child: Signal<any> = sig.children[i];
      child.parents = child.parents.filter((parent: Signal<any>) => {
        return parent !== sig;
      });
    }

    for (let i = 0; i < parentLen; i++) {
      const parent: Signal<any> = sig.parents[i];
      parent.children = parent.children.filter((child: Signal<any>) => {
        return child !== sig;
      });
    }

    sig.children.length = 0;
    sig.parents.length = 0;
  }

  /**
   * Logs the values of a given signal to the console.
   *
   * @name logValue
   * @method
   * @memberof Frampton.Signal.Signal#
   * @returns {Frampton.Signal.Signal}
   */
  logValue(msg?: string): Signal<T> {
    const parent: Signal<T> = this;
    return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
      if (msg !== undefined) {
        log(msg, parent.value);
      } else {
        log(<any>parent.value);
      }
      sink(parent.value);
    }, [ parent ], parent.value);
  }

  /**
   * @name debounce
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {Number} delay - Milliseconds to debounce the signal
   * @returns {Frampton.Signal.Signal}
   */
  debounce(delay: number): Signal<T> {
    const parent: Signal<T> = this;
    var timer: number = null;
    return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
      if (!timer) {
        timer = setTimeout(() => {
          sink(parent.value);
          timer = null;
        }, (delay || 10));
      }
    }, [ parent ], parent.value);
  }

  /**
   * @name and
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {Frampton.Signal.Signal} predicate - A Signal that must be truthy for values on this Signal
   *                                             to continue.
   * @returns {Frampton.Signal.Signal}
   */
  and(predicate: Signal<any>): Signal<T> {
    const parent: Signal<T> = this;
    const initial = (parent.hasValue && predicate.value) ? parent.value : undefined;
    return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
      if (predicate.value) {
        sink(parent.value);
      }
    }, [ parent ], initial);
  }

  /**
   * @name not
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {Frampton.Signal.Signal} predicate - A Signal that must be falsy for values on this Signal
   *                                             to continue.
   * @returns {Frampton.Signal.Signal}
   */
  not(predicate: Signal<any>): Signal<T> {
    const parent: Signal<T> = this;
    const initial = (parent.hasValue && !predicate.value) ? parent.value : undefined;
    return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
      if (!predicate.value) {
        sink(parent.value);
      }
    }, [ parent ], initial);
  }

  /**
   * ap(<*>) :: Signal (a -> b) -> Signal a -> Signal b
   *
   * @name ap
   * @method
   * @memberof Frampton.Signal.Signal#
   * @param {Frampton.Signal.Signal} arg
   * @returns {Frampton.Signal.Signal}
   */
  ap<A,B>(this: Signal<(val: A) => B>, arg: Signal<A>): Signal<B> {
    const parent: Signal<(val: A) => B> = this;
    const initial = (parent.hasValue && arg.hasValue) ? parent.value(arg.value) : undefined;

    return new Signal((self: Signal<B>, sink: ValueSink<B>) => {
      sink(parent.value(arg.value));
    }, [ parent ], initial);
  }

  /**
   * dropRepeats :: Signal a -> Signal a
   *
   * Uses strict equals to drop repeated values from the parent signal.
   *
   * @name dropRepeats
   * @method
   * @memberof Frampton.Signal.Signal#
   * @returns {Frampton.Signal.Signal}
   */
  dropRepeats(): Signal<T> {
    return this.filterPrevious((prev: T, next: T): boolean => {
      return (prev !== next);
    });
  }

  /**
   * Like reduce on Arrays, this method is used to reduce all values of a Signal down to a
   * single value using the given function.
   *
   * The function recieves arguments in the order of (accumulator, next value). The function
   * returns a new value that will then be the new accumulator for the next interation.
   *
   * @name fold
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {Function} fn
   * @param {Function} initial
   * @returns {Frampton.Signal.Signal}
   */
  fold<B>(fn: SignalReducer<T,B>, initial: B): Signal<B> {
    const parent: Signal<T> = this;

    return new Signal((self: Signal<B>, sink: ValueSink<B>) => {
      sink(fn(self.value, parent.value));
    }, [ parent ], initial);
  }

  /**
   * @name sample
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {Frampton.Signal.Signal} tag
   * @returns {Frampton.Signal.Signal}
   */
  sample<B>(tag: Signal<B>): Signal<B> {
    const parent: Signal<T> = this;

    return new Signal<B>((self: Signal<B>, sink: ValueSink<B>) => {
      sink(tag.value);
    }, [ parent ], tag.value);
  }

  /**
   * @name merge
   * @method
   * @memberof Frampton.Signal.Signal#
   * @param {Frampton.Signal.Signal} sig2
   * @returns {Frampton.Signal.Signal}
   */
  merge(sig2: Signal<T>): Signal<T> {
    const sig1: Signal<T> = this;
    return merge(sig1, sig2);
  }

  /**
   * @name take
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {Number} limit
   * @returns {Frampton.Signal.Signal}
   */
  take(limit: number): Signal<T> {
    const parent: Signal<T> = this;

    return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
      if (limit-- > 0) {
        sink(parent.value);
      } else {
        self.close();
      }
    }, [ parent ], undefined);
  }

  /**
   * Return the values of these signals as a tuple
   *
   * @name zip
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {Frampton.Signal.Signal} sig
   * @returns {Frampton.Signal.Signal}
   */
  zip<U>(sig: Signal<U>): Signal<[T,U]> {
    const parent: Signal<T> = this;
    const initial: [T,U] = [parent.value, sig.value];

    return new Signal<[T,U]>((self: Signal<[T,U]>, sink: ValueSink<[T,U]>) => {
      sink([ parent.value, sig.value ]);
    }, [ parent ], initial);
  }

  /**
   * Remove values from the Signal based on the given predicate function. If a function is not
   * given then filter will use strict equals with the value given to test new values on the
   * Signal.
   *
   * @name filter
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {*} predicate - Usually a function to test values of the Signal
   * @returns {Frampton.Signal.Signal}
   */
  filter(predicate: SignalPredicate<T>): Signal<T> {
    const parent = this;

    const filterFn: SignalPredicate<T> =
      function(val: T): boolean {
        if (typeof predicate === 'function') {
          return predicate(val);
        } else {
          return (predicate === val);
        }
      };

    const initial: T = (
      (parent.hasValue && filterFn(parent.value)) ?
        parent.value :
        undefined
    );

    return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
      if (filterFn(parent.value)) {
        sink(parent.value);
      }
    }, [ parent ], initial);
  }

  /**
   * @name filterPrevious
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {Function} predicate - A binary function to test the previous value against the current
   *                               value to decide if you want to keep the new value.
   * @returns {Frampton.Signal.Signal}
   */
  filterPrevious(predicate: (prev: T, next: T) => boolean): Signal<T> {
    const parent: Signal<T> = this;
    const initial: T = (parent.hasValue) ? parent.value : undefined;

    return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
      if (predicate(self.value, parent.value)) {
        sink(parent.value);
      }
    }, [ parent ], initial);
  }

  /**
   * @name map
   * @method
   * @private
   * @memberof Frampton.Signal.Signal#
   * @param {*} mapping - A function or value to map the signal with. If a function, the value
   *                        on the parent signal will be passed to the function and the signal will
   *                        be mapped to the return value of the function. If a value, the value of
   *                        the parent signal will be replaced with the value.
   * @returns {Frampton.Signal.Signal} A new signal with mapped values
   */
  map<B>(mapping: SignalMapping<T,B>): Signal<B> {
    const parent: Signal<T> = this;

    const mappingFn: SignalMapping<T,B> =
      function(val: T): B {
        if (typeof mapping === 'function') {
          return mapping(val);
        } else {
          return mapping;
        }
      };

    const initial: B = (
      (parent.hasValue) ?
        mappingFn(parent.value) :
        undefined
    );

    return new Signal<B>((self: Signal<B>, sink: ValueSink<B>): void => {
      sink(mappingFn(parent.value));
    }, [ parent ], initial);
  }

  /**
   * @name delay
   * @method
   * @memberof Frampton.Signal.Signal#
   * @param {Number} time - Milliseconds to delay values of this Signal.
   * @returns {Frampton.Signal.Signal}
   */
  delay(time: number): Signal<T> {
    const parent: Signal<T> = this;
    return new Signal((self: Signal<T>, sink: ValueSink<T>) => {
      (function(saved) {
        setTimeout(() => {
          sink(saved);
        }, time);
      }(parent.value));
    }, [ parent ], parent.value);
  }
}