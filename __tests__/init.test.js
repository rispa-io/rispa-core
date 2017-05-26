/* eslint-disable import/no-dynamic-require, global-require */

jest.resetAllMocks()
jest.mock('events')
jest.mock('glob')
jest.mock('path')
jest.mock('../registry')

const glob = require('glob')
const events = require('events')
const path = require('path')

const init = require('../init')

const createRegistry = require('../registry')

describe('init', () => {
  const basePath = '/sample/path'
  const relActivatorPath = '.rispa/activator.js'
  const searchPattern = `${basePath}/*/${relActivatorPath}`
  const pluginsNames = ['core']
  const activatorsPaths = pluginsNames.map(pluginName =>
    searchPattern.replace('*', pluginName)
  )

  beforeAll(() => {
    path.setMockResolveReturnValue(basePath)

    glob.setMockPaths({
      [searchPattern]: activatorsPaths,
    })
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should success init activators', () => {
    const addListener = jest.fn()
    const removeListener = jest.fn()
    const emit = jest.fn()

    const event = 'event'
    const handler = 'handler'

    const registry = Object.create(null)
    const command = 'command'
    const data = Object.create(null)

    createRegistry.setMockReturnValue(registry)

    events.setMockMethods({
      on: addListener,
      removeListener,
      emit,
    })

    activatorsPaths.forEach(activatorPath => {
      jest.mock(activatorPath, () => (on, off) => {
        on('event', 'handler')
        off('event', 'handler')
      }, { virtual: true })
    })

    expect(init(command, data)).toBeFalsy()

    expect(addListener).toBeCalledWith(event, handler)

    expect(removeListener).toBeCalledWith(event, handler)

    expect(emit).toBeCalledWith('init', command, registry, data)
    expect(emit).toBeCalledWith('prepare', command, registry, data)
    expect(emit).toHaveBeenLastCalledWith('start', command, registry, data)
  })
})
