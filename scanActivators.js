import fs from 'fs-extra'
import path from 'path'
import glob from 'glob'

export const PLUGINS_CACHE_PATH = './build/plugins.json'
export const LERNA_JSON = 'lerna.json'
export const PLUGIN_PREFIX = '@rispa/'
export const ACTIVATOR_PATH = './.rispa/activator.js'
export const PACKAGE_JSON = 'package.json'
export const NODE_MODULES_PLUGINS_PATH = `./node_modules/${PLUGIN_PREFIX}*`

export const searchForFile = (dir, filename) => {
  let rootDir
  let currentDir = dir
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.resolve(currentDir, `./${filename}`))) {
      rootDir = currentDir
      break
    }

    currentDir = path.dirname(currentDir)
  }

  return rootDir
}

export const searchLernaDir = dir => searchForFile(dir, LERNA_JSON)

export const searchPackageDir = dir => searchForFile(dir, PACKAGE_JSON)

export const deduplicateActivators = activatorsPaths => {
  const activatorsByName = {}

  activatorsPaths.forEach(activatorPath => {
    const pluginPath = searchPackageDir(activatorPath)
    if (pluginPath) {
      const packageJSON = fs.readJsonSync(`${pluginPath}/${PACKAGE_JSON}`, { throws: false })
      if (packageJSON) {
        activatorsByName[packageJSON.name] = activatorPath
      }
    }
  })

  return Object.values(activatorsByName)
}

export const readPluginsCache = projectPath => {
  const pluginsCachePath = path.resolve(projectPath, PLUGINS_CACHE_PATH)

  return fs.readJsonSync(pluginsCachePath, { throws: false })
}

export const readActivatorsCache = projectPath => {
  const pluginsCache = readPluginsCache(projectPath)
  if (!pluginsCache || !pluginsCache.plugins) {
    return null
  }

  return Object.values(pluginsCache.plugins)
    .map(plugin => plugin.activator)
    .filter(activator => !!activator)
    .map(activator => require(activator))
}

const scanActivatorsByPaths = paths => {
  const activatorPaths = paths.reduce((result, pluginsPath) => (
    result.concat(glob.sync(path.resolve(pluginsPath, ACTIVATOR_PATH)))
  ), [])

  return deduplicateActivators(activatorPaths)
    .map(activator => require(activator))
}

export const readPluginsPaths = projectPath => {
  const lernaJsonPath = path.resolve(projectPath, LERNA_JSON)
  const { packages: lernaPackages } = fs.readJsonSync(lernaJsonPath, { throws: false }) || {}
  if (!lernaPackages) {
    throw new Error('Incorrect configuration file `lerna.json`')
  }

  const lernaPluginsPaths = lernaPackages.map(pluginsPath => path.resolve(projectPath, `./${pluginsPath}`))
  const pluginsPaths = lernaPluginsPaths
    .map(pluginsPath => path.resolve(pluginsPath, NODE_MODULES_PLUGINS_PATH))
    .concat(path.resolve(projectPath, NODE_MODULES_PLUGINS_PATH))
    .concat(lernaPluginsPaths)

  return pluginsPaths
}

export const scanActivatorsInProject = projectPath => {
  const activatorsCache = readActivatorsCache(projectPath)
  if (activatorsCache) {
    return activatorsCache
  }

  const pluginsPaths = readPluginsPaths(projectPath)
  return scanActivatorsByPaths(pluginsPaths)
}

export const scanActivatorsInPlugin = pluginPath => (
  scanActivatorsByPaths([
    pluginPath,
    path.resolve(pluginPath, NODE_MODULES_PLUGINS_PATH),
  ])
)

export default function scanActivators(cwd) {
  const projectPath = searchLernaDir(cwd)
  if (projectPath) {
    return scanActivatorsInProject(projectPath)
  }

  return scanActivatorsInPlugin(cwd)
}
