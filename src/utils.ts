export const isPromise = (value: any) =>
  !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function'
