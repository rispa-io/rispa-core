const path = jest.genMockFromModule('path')

let mockResolveReturnValue = ''

path.resolve = () => mockResolveReturnValue

path.setMockResolveReturnValue = value => {
  mockResolveReturnValue = value
}

module.exports = path
