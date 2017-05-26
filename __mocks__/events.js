let EventEmitter = jest.genMockFromModule('events')

let mockMethods

EventEmitter = function () {
  Object.assign(this, mockMethods)
}

EventEmitter.setMockMethods = newMockMethods => {
  mockMethods = newMockMethods
}

module.exports = EventEmitter
