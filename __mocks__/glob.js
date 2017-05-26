// const glob = jest.genMockFromModule('glob') - not working
const glob = {}

let mockPaths = {
}

glob.setMockPaths = newMockPaths => { mockPaths = newMockPaths }

glob.sync = path => {
  if (typeof path !== 'string') {
    throw new Error()
  }

  return mockPaths[path] || []
}

module.exports = glob
