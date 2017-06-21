const fs = require('fs-extra')
const glob = require('glob')
const path = require('path')
const EventEmitter = require('events')
const createRegistry = require('./registry')

const scanActivators = () => {
  const relPath = path.resolve(__dirname, '../')
  const activators = glob
    .sync(`${relPath}/*/.rispa/activator.js`)
    .map(activator => require(activator))
  return activators
}

const getActivatorsFromCache = () => {
  const cacheActivatorsPath = path.resolve(__dirname, '../../build/activators.json')

  const cache = fs.readJsonSync(cacheActivatorsPath, { throws: false })

  if (cache) {
    const activators = Object.values(cache.packages)
      .map(plugin => plugin.activatorPath)
      .filter(activator => !!activator)
      .map(activator => require(activator))

    return activators
  }

  return false
}

const getActivators = () => getActivatorsFromCache() || scanActivators()

export function init(command, data, activators, emitter) {
  const on = (originalEvent, originalHandler) => {
    const [event, parsedCommand] = originalEvent.split(':')
    const anyCmdAllowed = parsedCommand === undefined

    const handler = (cmd, registry, commandData) => {
      if (anyCmdAllowed || parsedCommand === cmd) {
        originalHandler(registry, commandData)
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
