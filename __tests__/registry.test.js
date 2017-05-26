/* eslint-disable import/no-dynamic-require, global-require */

jest.resetAllMocks()

const createRegistry = require('../registry')

describe('create registry', () => {
  let registry

  beforeEach(() => {
    registry = createRegistry()
  })

  it('should success create registry', () => {
    expect(registry).toBeDefined()
  })

  it('should success set value', () => {
    const key = 'key'
    const value = 'value'

    registry.set(key, value)

    expect(registry.get(key)).toBe(value)
  })

  it('should success add values if key not exist', () => {
    const key = 'key'
    const values = [1, 2, 3, 4, 5]

    registry.add(key, ...values)

    expect(registry.get(key)).toEqual(values)
  })

  it('should success add values if key exist', () => {
    const key = 'key'
    const values = [1, 2, 3, 4, 5]

    registry.set(key, values.slice(0, 1))

    registry.add(key, ...values.slice(1))

    expect(registry.get(key)).toEqual(values)
  })
})
