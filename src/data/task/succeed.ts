import { create, Task } from './task';


/**
 * succeed :: a -> Task x a
 *
 * Creates a Task that always succeeds with the given value.
 *
 * @name succeed
 * @method
 * @memberof Frampton.Data.Task
 * @param {*} val - Value used as the return value of the resolve branch.
 * @returns {Frampton.Data.Task}
 */
export default function succeed<T>(val: T): Task<any,T,any> {
  return create((sinks) => sinks.resolve(val));
}
