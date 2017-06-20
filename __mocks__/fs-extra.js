const mockFsExtra = jest.genMockFromModule('fs-extra')

let mockFiles = {}

mockFsExtra.setMockFiles = newMockFiles => {
  mockFiles = newMockFiles
}

mockFsExtra.readJsonSync = path => mockFiles[path]

mockFsExtra.existsSync = path => path in mockFiles

module.exports = mockFsExtra
