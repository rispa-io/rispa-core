import EventEmitter from '../__mocks__/event-emitter'
import runInit, { init } from '../init'

jest.resetAllMocks()
jest.mock('events')
jest.mock('../registry')
jest.mock('../scanActivators', () => require.requireActual('../__mocks__/scanActivators'))

const mockEvents = require.requireMock('events')
const { setMockActivators } = require.requireMock('../scanActivators')

const mockCreateRegistry = require.requireMock('../registry')

describe('init', () => {
  const activator = jest.fn(on => {
    const off = on('event', jest.fn())
    off()
  })

  setMockActivators([activator])

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

    expect(runInit(command, data)).toBeUndefined()

    expect(activator).toBeCalled()
    expect(addListener).toBeCalled()
    expect(removeListener).toBeCalled()

    expect(emit).toBeCalledWith('init', command, registry, data)
    expect(emit).toBeCalledWith('prepare', command, registry, data)
    expect(emit).toHaveBeenLastCalledWith('start', command, registry, data)
  })

  it('should filter command which specified after `:`', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()
    const activator1 = on => {
      on('init:one', handler1)
      on('init:two', handler2)
    }

    const emitter = new EventEmitter()

    init('one', {}, [activator1], emitter)
    expect(handler1).toBeCalled()
    expect(handler2).not.toBeCalled()
  })
})
