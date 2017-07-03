import { PACKAGE_JSON } from '../scanActivators'

jest.mock('glob')
jest.mock('fs-extra')
jest.unmock('path')

const path = require.requireActual('path')

const mockGlob = require.requireMock('glob')
const mockFs = require.requireMock('fs-extra')

const {
  LERNA_JSON,
  ACTIVATOR_PATH,
  PLUGINS_CACHE_PATH,
  NODE_MODULES_PLUGINS_PATH,

  default: scanActivators,
  searchForFile,
  deduplicateActivators,
  readPluginsPaths,
} = require.requireActual('../scanActivators')

describe('scan activators', () => {
  const projectDir = '/project/dir'
  const cwd = `${projectDir}/packages/plugin-name`
  const pluginNames = ['rispa-webpack']
  const packagesPath = path.resolve(projectDir, './packages')
  const pluginPaths = pluginNames.map(pluginName =>
    path.resolve(packagesPath, `./${pluginName}`)
  )
  const activatorsPaths = pluginPaths.map(pluginPath =>
    path.resolve(pluginPath, ACTIVATOR_PATH)
  )

  activatorsPaths.forEach(activatorPath => {
    jest.mock(activatorPath, () => 'activator', { virtual: true })
  })

  it('should success scan in project', () => {
    mockFs.setMockFiles(Object.assign(
      {
        [path.resolve(projectDir, `./${LERNA_JSON}`)]: {
          packages: ['packages/*'],
        },
      },
      pluginNames.reduce((files, pluginName) => {
        const pluginPath = path.resolve(packagesPath, `./${pluginName}`)
        files[path.resolve(pluginPath, `./${PACKAGE_JSON}`)] = {
          name: pluginName,
        }
        return files
      }, {})
    ))

    mockGlob.setMockPaths({
      [path.resolve(packagesPath, './*', ACTIVATOR_PATH)]: activatorsPaths,
    })

    expect(scanActivators(cwd)).toEqual(['activator'])
  })

  it('should success read cache in project', () => {
    mockFs.setMockFiles({
      [path.resolve(projectDir, `./${LERNA_JSON}`)]: true,
      [path.resolve(projectDir, PLUGINS_CACHE_PATH)]: {
        plugins: {
          [pluginNames[0]]: {
            activator: activatorsPaths[0],
          },
        },
      },
    })

    expect(scanActivators(cwd)).toEqual(['activator'])
  })

  it('should success read in plugin', () => {
    mockFs.setMockFiles(
      pluginNames.reduce((files, pluginName) => {
        const pluginPath = path.resolve(packagesPath, `./${pluginName}`)
        files[path.resolve(pluginPath, `./${PACKAGE_JSON}`)] = {
          name: pluginName,
        }
        return files
      }, {})
    )

    mockGlob.setMockPaths({
      [path.resolve(pluginPaths[0], ACTIVATOR_PATH)]: activatorsPaths,
    })

    expect(scanActivators(pluginPaths[0])).toEqual(['activator'])
  })
})

describe('search for file', () => {
  const baseDir = '/path/to/dir'
  const dir = `${baseDir}/with/dir`
  const fileName = 'fileName'

  it('should find dir', () => {
    mockFs.setMockFiles({
      [path.resolve(baseDir, `./${fileName}`)]: true,
    })

    expect(searchForFile(dir, fileName)).toBe(baseDir)
  })
})

describe('deduplicate activators', () => {
  const packagesPath1 = '/path/to/plugins'
  const packagesPath2 = '/path/to'
  const packagesPath3 = '/path/'
  const pluginName = 'rispa-core'

  it('should return deduplicate activator', () => {
    const activatorPaths = [
      path.resolve(packagesPath1, `./${pluginName}`, ACTIVATOR_PATH),
      path.resolve(packagesPath2, `./${pluginName}`, ACTIVATOR_PATH),
      path.resolve(packagesPath3, ACTIVATOR_PATH),
      '/invalid-path',
    ]

    mockFs.setMockFiles({
      [path.resolve(packagesPath1, `./${pluginName}`, `./${PACKAGE_JSON}`)]: {
        name: pluginName,
      },
      [path.resolve(packagesPath2, `./${pluginName}`, `./${PACKAGE_JSON}`)]: {
        name: pluginName,
      },
      [path.resolve(packagesPath3, `./${PACKAGE_JSON}`)]: null,
    })

    expect(deduplicateActivators(activatorPaths)).toEqual([activatorPaths[1]])
  })
})

describe('read plugins paths', () => {
  const projectDir = '/project/dir'

  it('should success read', () => {
    mockFs.setMockFiles({
      [path.resolve(projectDir, `./${LERNA_JSON}`)]: {
        packages: ['packages/*'],
      },
    })

    expect(readPluginsPaths(projectDir)).toEqual([
      path.resolve(projectDir, './packages/*', NODE_MODULES_PLUGINS_PATH),
      path.resolve(projectDir, NODE_MODULES_PLUGINS_PATH),
      path.resolve(projectDir, './packages/*'),
    ])
  })

  it('should failed read lerna.json', () => {
    mockFs.setMockFiles({})

    expect(() => readPluginsPaths(projectDir)).toThrow('Incorrect configuration file `lerna.json`')
  })
})
