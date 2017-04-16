import curry, { Curried2Result } from '../utils/curry';

/**
 * remove :: List a -> Any a -> List a
 *
 * @name remove
 * @method
 * @memberof Frampton.List
 * @param {Array} xs
 * @param {Object} obj
 */
export default curry(function curried_remove<T>(obj: T, xs: Array<T>): Array<T> {
  const ys: Array<T> = [];
  const len = xs.length;

  for (let i = 0; i < len; i++) {
    const item = xs[i];
    if (obj !== item) {
      ys.push(item);
    }
  }

  return ys;
});
