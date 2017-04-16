/**
 * @name tail
 * @method
 * @memberof Frampton.List
 */
import { isArray } from '../utils';

export default function tail<T>(xs: Array<T>): Array<T> {
  switch (xs.length) {
    case 0: return [];
    default: return xs.slice(1);
  }
}
