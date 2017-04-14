import { create, Task } from './task';


/**
 * fail :: x -> Task x a
 *
 * Creates a Task that always fails with the given value.
 *
 * @name fail
 * @method
 * @memberof Frampton.Data.Task
 * @param {*} err - Value used as the return value of the reject branch.
 * @returns {Frampton.Data.Task}
 */
export default function fail<T>(err: T): Task<T,any,any> {
  return create((sinks) => sinks.reject(err));
}
