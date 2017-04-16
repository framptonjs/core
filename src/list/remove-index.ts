import curry, { Curried2Result } from '../utils/curry';

/**
 * @name removeIndex
 * @method
 * @memberof Frampton.List
 * @param {Number} index
 * @param {Array} xs
 * @returns {Array} A new array
 */
export default curry(function remove_index<T>(index: number, xs: Array<T>): Array<T> {
  const len = xs.length;
  const ys = [];

  for (let i = 0; i < len; i++) {
    if (i !== index) {
      ys.push(xs[i]);
    }
  }

  return ys;
});
