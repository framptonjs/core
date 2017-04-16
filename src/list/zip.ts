import curry, { Curried2Result } from '../utils/curry';

/**
 * zip :: List a -> List b - List (a, b)
 *
 * @name zip
 * @method
 * @memberof Frampton.List
 * @param {Array} xs
 * @param {Array} ys
 */
export default curry(function zip_array<A,B>(xs: Array<A>, ys: Array<B>): Array<[A,B]> {
  const xLen = xs.length;
  const yLen = ys.length;
  const len = ((xLen > yLen) ? yLen : xLen);
  const zs = [];

  for (let i = 0; i < len; i++) {
    const ts: [A,B] = [xs[i], ys[i]];
    zs.push(ts);
  }

  return zs;
});
