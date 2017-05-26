const createRegistry = () => {
  const registry = {}

  return {
    set(key, value) {
      registry[key] = value
    },
    get(key) {
      return registry[key]
    },
    add(key, ...values) {
      if (!registry[key]) {
        registry[key] = []
      }

      registry[key] = registry[key].concat(values)
    },
  }
}

export default createRegistry
