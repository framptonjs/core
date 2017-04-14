export default (obj: any): boolean => (
  typeof obj === 'object' &&
  typeof obj.then === 'function'
);