export default class EventEmitter {
  listeners = {}
  maxListeners = 10

  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => {
        listener(...args)
      })
    }
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
  }

  setMaxListeners(maxListeners) {
    this.maxListeners = maxListeners
  }
}
