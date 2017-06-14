const glob = require('glob')
const path = require('path')
const EventEmitter = require('events')
const createRegistry = require('./registry')

const getActivators = () => {
  /* eslint-disable global-require, import/no-dynamic-require */
  const relPath = path.resolve(__dirname, '../')
  const activators = glob
    .sync(`${relPath}/*/.rispa/activator.js`)
    .map(activator => require(activator))
  return activators
}

export function init(command, data, activators, emitter) {
  const on = (originalEvent, originalHandler) => {
    const [event, parsedCommand] = originalEvent.split(':')
    const anyCmdAllowded = parsedCommand === undefined

    const handler = (cmd, registry) => {
      if (anyCmdAllowded || parsedCommand === cmd) {
        originalHandler(registry)
      }
    }
    emitter.on(event, handler)

    return function off() {
      emitter.removeListener(event, handler)
    }
  }

  activators.forEach(activator => activator(on))

  const registry = createRegistry()

  emitter.emit('init', command, registry, data)
  emitter.emit('prepare', command, registry, data)
  emitter.emit('start', command, registry, data)
}

export default function runInit(command, data) {
  const activators = getActivators()
  const emitter = new EventEmitter()
  init(command, data, activators, emitter)
}
