import { create, Task } from './task';
import curry, { Curried2Result } from '../../utils/curry';

/**
 * @name delay
 * @method
 * @memberof Frampton.Data.Task
 * @param {Number} time - Miliseconds to delay function
 * @param {Function} fn - Function to delay
 * @returns {Frampton.Data.Task}
 */
export default curry(function delay<T>(time: number, val: T): Task<any,T,any> {
  return create((sinks) => {
    setTimeout(() => {
      sinks.resolve(val);
    }, time);
  });
});
