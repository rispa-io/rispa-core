let registry = jest.genMockFromModule('../registry')

let mockReturnValue

registry = function () {
  return mockReturnValue
}

registry.setMockReturnValue = newMockReturnValue => { mockReturnValue = newMockReturnValue }

module.exports = registry
