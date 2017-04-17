import { log, warn } from '../../logging';
import { Signal } from '../signal';
import { Task } from './task';


/**
 * execute :: Signal Task x a -> Signal a -> ()
 *
 * Takes a Signal of Tasks to execute and a function to call with the resolve values
 * of those Tasks. Progress and reject values are ignored (logged to the console in dev mode).
 * It is suggested to use Tasks that have their reject and progress values mapped to reslove
 * values using the recover and progress methods on the Task prototype.
 *
 * @name execute
 * @memberof Frampton.Task
 * @static
 * @param {Frampton.Signals.Signal} tasks - Signal of Tasks to execute
 * @param {Function} onValue - A function to pass the resolve values to
 */
export default function execute<T>(tasks: Signal<Task<any,T,any>>, onValue: (val: T) => void): void {
  tasks.onValue((task: Task<any,T,any>): void => {
    task.run({
      reject(err: any): void {
        warn('Error running task: ', err);
      },
      resolve(val: T): void {
        onValue(val);
      },
      progress(val: any): void {
        log('Task progress: ', val);
      }
    });
  });
}
