export const reduce = (o: any, fn: Function): string => {
  let collection: Array<string>

  if (Array.isArray(o)) {
    collection = o
  } else if (typeof o === 'object') {
    collection = Object.keys(o).map(k => o[k])
  }

  return collection.reduce.call(null, fn)
}

