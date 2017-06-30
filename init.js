const fs = require('fs-extra')
const glob = require('glob')
const path = require('path')
const EventEmitter = require('events')
const createRegistry = require('./registry')

const LERNA_CONFIG = 'lerna.json'
const PACKAGE_JSON = 'package.json'
const CACHE_PATH = './build/plugins.json'
const ACTIVATOR_PATH = './.rispa/activator.js'

const searchForFile = (dir, filename) => {
  let rootDir
  let currentDir = dir
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(`${currentDir}/${filename}`)) {
      rootDir = currentDir
      break
    }

    currentDir = path.dirname(currentDir)
  }

  return rootDir
}

const searchLernaDir = dir => searchForFile(dir, LERNA_CONFIG)
const searchPackageDir = dir => searchForFile(dir, PACKAGE_JSON)

const deduplicateActivators = activatorsPaths => {
  const activatorsByName = {}

  activatorsPaths.forEach(activatorPath => {
    const pluginPath = searchPackageDir(activatorPath)
    if (pluginPath) {
      let pluginName
      try {
        const packageJSON = fs.readJsonSync(`${pluginPath}/${PACKAGE_JSON}`)
        pluginName = packageJSON.name
      } catch (e) {
        throw new Error('Cannot read package.json')
      }

      if (pluginName) {
        activatorsByName[pluginName] = activatorPath
      }
    }
  })

  return Object.values(activatorsByName)
}

const scanActivators = () => {
  let pluginsPaths

  const rootDir = searchLernaDir(process.cwd())

  if (rootDir) {
    const lernaJsonPath = `${rootDir}/${LERNA_CONFIG}`
    let packagesPaths
    try {
      const lernaConfig = fs.readJsonSync(lernaJsonPath)
      packagesPaths = lernaConfig.packages
    } catch (e) {
      throw new Error('Incorrect configuration file `lerna.json`')
    }

    pluginsPaths = packagesPaths.map(
      packagesPath => path.resolve(rootDir, packagesPath)
    )
    pluginsPaths.concat(packagesPaths.map(
      packagesPath => path.resolve(rootDir, packagesPath, './node_modules/@rispa/*')
    ))
  } else {
    pluginsPaths = [
      process.cwd(),
      path.resolve(process.cwd(), './node_modules/@rispa/*'),
    ]
  }

  const activators = pluginsPaths.map(pluginPath =>
    glob.sync(path.resolve(pluginPath, ACTIVATOR_PATH))
  )

  return deduplicateActivators([].concat(...activators))
    .map(activator => require(activator))
}

const getActivatorsFromCache = () => {
  const rootDir = searchLernaDir(process.cwd())

  const cachePath = path.resolve(rootDir, CACHE_PATH)
  const cache = fs.readJsonSync(cachePath, { throws: false })

  if (cache) {
    const activators = Object.values(cache.plugins)
      .map(plugin => plugin.activator)
      .filter(activator => !!activator)
      .map(activator => require(activator))

    return activators
  }

  return scanActivators()
}

const getActivators = () => getActivatorsFromCache() || scanActivators()

export function init(command, data, activators, emitter) {
  const on = (originalEvent, originalHandler) => {
    const [event, parsedCommand] = originalEvent.split(':')
    const anyCmdAllowed = parsedCommand === undefined

    const handler = (cmd, registry, commandData) => {
      if (anyCmdAllowed || parsedCommand === cmd) {
        originalHandler(registry, commandData)
      }
    }
    emitter.on(event, handler)

    return function off() {
      emitter.removeListener(event, handler)
    }
  }

  activators.forEach(activator => activator(on))

  const registry = createRegistry()

  emitter.emit('init', command, registry, data)
  emitter.emit('prepare', command, registry, data)
  emitter.emit('start', command, registry, data)
}

export default function runInit(command, data) {
  const activators = getActivators()
  const emitter = new EventEmitter()
  init(command, data, activators, emitter)
}
