const mockEventEmitter = jest.genMockFromModule('events')

let mockMethods

function EventEmitter() {
  Object.assign(this, mockMethods)
}

EventEmitter.setMockMethods = newMockMethods => {
  mockMethods = newMockMethods
}

module.exports = Object.assign(EventEmitter, mockEventEmitter)
