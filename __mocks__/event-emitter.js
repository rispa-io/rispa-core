export default class EventEmitter {
  listeners = {};
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
}

EventEmitter.prototype.setMaxListeners = jest.fn()
