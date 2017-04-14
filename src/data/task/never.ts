import { create, Task } from './task';


/**
 * never :: Task x a
 *
 * Creates a Task that never resolves.
 *
 * @name never
 * @method
 * @memberof Frampton.Data.Task
 * @returns {Frampton.Data.Task}
 */
export default function never(): Task<any,any,any> {
  return create(() => {});
}
