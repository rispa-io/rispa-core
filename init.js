import EventEmitter from 'events'
import createRegistry from './registry'
import scanActivators from './scanActivators'

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
  const activators = scanActivators(process.cwd())
  const emitter = new EventEmitter()
  emitter.setMaxListeners(100)

  init(command, data, activators, emitter)
}
