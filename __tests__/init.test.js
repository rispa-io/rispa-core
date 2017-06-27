import EventEmitter from '../__mocks__/event-emitter'
import runInit, { init } from '../init'

jest.resetAllMocks()
jest.mock('events')
jest.mock('glob')
jest.mock('path')
jest.mock('fs-extra')
jest.mock('../registry')

const mockGlob = require.requireMock('glob')
const mockEvents = require.requireMock('events')
const mockPath = require.requireMock('path')
const mockFs = require.requireMock('fs-extra')

const mockCreateRegistry = require.requireMock('../registry')

describe('init', () => {
  const basePath = '/sample/path'
  const relActivatorPath = '.rispa/activator.js'
  const searchPattern = `${basePath}/*/${relActivatorPath}`
  const pluginsNames = ['core']
  const activatorsPaths = pluginsNames.map(pluginName => searchPattern.replace('*', pluginName))

  beforeAll(() => {
    mockPath.setMockResolveReturnValue(basePath)

    mockGlob.setMockPaths({
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

    const registry = Object.create(null)
    const command = 'command'
    const data = Object.create(null)

    mockCreateRegistry.setMockReturnValue(registry)

    mockEvents.setMockMethods({
      on: addListener, removeListener, emit,
    })

    activatorsPaths.forEach(activatorPath => {
      jest.mock(activatorPath, () => on => {
        const off = on('event', jest.fn())
        off()
      }, { virtual: true })
    })

    expect(runInit(command, data)).toBeUndefined()

    expect(addListener).toBeCalled()
    expect(removeListener).toBeCalled()

    expect(emit).toBeCalledWith('init', command, registry, data)
    expect(emit).toBeCalledWith('prepare', command, registry, data)
    expect(emit).toHaveBeenLastCalledWith('start', command, registry, data)
  })

  it('should success init activators with cache', () => {
    const addListener = jest.fn()
    const removeListener = jest.fn()
    const emit = jest.fn()

    const registry = Object.create(null)
    const command = 'command'
    const data = Object.create(null)

    mockCreateRegistry.setMockReturnValue(registry)

    mockFs.setMockFiles({
      [basePath]: {
        plugins: {
          [pluginsNames[0]]: {
            activator: activatorsPaths[0],
          },
        },
      },
    })

    mockEvents.setMockMethods({
      on: addListener, removeListener, emit,
    })

    activatorsPaths.forEach(activatorPath => {
      jest.mock(activatorPath, () => on => {
        const off = on('event', jest.fn())
        off()
      }, { virtual: true })
    })

    expect(runInit(command, data)).toBeUndefined()

    expect(addListener).toBeCalled()
    expect(removeListener).toBeCalled()

    expect(emit).toBeCalledWith('init', command, registry, data)
    expect(emit).toBeCalledWith('prepare', command, registry, data)
    expect(emit).toHaveBeenLastCalledWith('start', command, registry, data)
  })

  it('should filter command which specified after `:`', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()
    const activator = on => {
      on('init:one', handler1)
      on('init:two', handler2)
    }

    const emitter = new EventEmitter()

    init('one', {}, [activator], emitter)
    expect(handler1).toBeCalled()
    expect(handler2).not.toBeCalled()
  })
})
