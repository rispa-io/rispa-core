const { resolve } = require('path')
const fs = require('fs')
const createDebug = require('debug')

const NODE_PATH = './node_modules'
const resolvePath = path => resolve(__dirname, path)
const logError = createDebug('rispa:error:core')

module.exports = () => {
  const babelrc = fs.readFileSync(resolvePath('./.babelrc'))
  let config = {}

  try {
    config = JSON.parse(babelrc)
  } catch (err) {
    logError('Error parsing your .babelrc.\n')
  }

  const resolveModulePath = (moduleName, moduleType) => {
    const moduleDir = moduleName.split('/').shift()
    return resolvePath(
      fs.existsSync(resolvePath(`${NODE_PATH}/${moduleDir}`))
        ? `${NODE_PATH}/${moduleName}`
        : `${NODE_PATH}/babel-${moduleType}-${moduleName}`
    )
  }

  const resolveModule = (module, moduleType) => {
    const [moduleName, moduleConfig] = Array.isArray(module) ? module : [module]

    if (moduleConfig && moduleConfig.moduleName) {
      moduleConfig.moduleName = resolvePath(`${NODE_PATH}/${moduleConfig.moduleName}`)
    }

    return [
      resolveModulePath(moduleName, moduleType),
      moduleConfig,
    ].filter(Boolean)
  }

  if (config.presets) {
    config.presets = config.presets.map(name => resolveModule(name, 'preset'))
  }

  if (config.plugins) {
    config.plugins = config.plugins.map(name => resolveModule(name, 'plugin'))
  }

  return config
}
