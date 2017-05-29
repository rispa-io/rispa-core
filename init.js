const glob = require('glob')
const path = require('path')
const EventEmitter = require('events')
const createRegistry = require('./registry')

const init = (command, data) => {
  /* eslint-disable global-require, import/no-dynamic-require */
  const relPath = path.resolve(__dirname, '../')
  const activators = glob
    .sync(`${relPath}/*/.rispa/activator.js`)
    .map(activator => require(activator))

  const emitter = new EventEmitter()
  const on = (event, handler) => emitter.on(event, handler)
  const off = (event, handler) => emitter.removeListener(event, handler)

  activators.forEach(activator => activator(on, off))

  const registry = createRegistry()

  emitter.emit('init', command, registry, data)
  emitter.emit('prepare', command, registry, data)
  emitter.emit('start', command, registry, data)
}

module.exports = init
