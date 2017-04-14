import { log, warn } from '../../logging';
import { create, Task, TaskSinks } from './task';

function logError(err: any) {
  warn('error in task: ', err);
}

function logProgress(val: any) {
  log('progress in task: ', val);
}

/**
 * when :: [Task x a] -> Task x [a]
 *
 * Creates a Task that waits for each of the given Tasks to resolve before it resolves.
 * When it does resolve, it resolves with an Array containing the resolved values of each
 * of its parent Tasks. The Array contains the resolve values in the same order as the
 * order that the parent Tasks were passed in.
 *
 * @name when
 * @method
 * @memberof Frampton.Data.Task
 * @param {Frampton.Data.Task[]} tasks - The Tasks to wait for
 * @returns {Frampton.Data.Task}
 */
export default function when<T>(...tasks: Array<Task<any, any, any>>): Task<void,Array<T>,void> {
  return create((sinks: TaskSinks<void,Array<T>,void>): void => {
    const valueArray: Array<any> = new Array(tasks.length);
    const len: number = tasks.length;
    var idx: number = 0;
    var count: number = 0;

    tasks.forEach((task) => {
      const index: number = idx++;
      task.run({
        reject(err) {
          logError(err);
          count = count + 1;
          valueArray[index] = null;
          if (count === len) {
            sinks.resolve(valueArray);
          }
        },
        resolve(val) {
          count = count + 1;
          valueArray[index] = val;
          if (count === len) {
            sinks.resolve(valueArray);
          }
        },
        progress: logProgress
      });
    });
  });
}
