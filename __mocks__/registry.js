const mockRegistry = jest.genMockFromModule('../registry')

let mockReturnValue

function registry() {
  return mockReturnValue
}

registry.setMockReturnValue = newMockReturnValue => { mockReturnValue = newMockReturnValue }

module.exports = Object.assign(registry, mockRegistry)
