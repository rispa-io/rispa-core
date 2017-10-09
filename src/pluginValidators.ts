import { PluginManager } from './PluginManager'
import PluginModule from './PluginModule'

export type PluginValidatorErrors = Array<Error | TypeError>
export type PluginValidator = (manager: PluginManager, pluginModule: PluginModule) => PluginValidatorErrors

function validateInit(manager: PluginManager, pluginModule: PluginModule): PluginValidatorErrors {
  const errors = []

  if (!pluginModule.init) {
    errors.push(new TypeError('Init fabric required'))
  } else if (typeof pluginModule.init !== 'function') {
    errors.push(new TypeError('Invalid init fabric type'))
  }

  return errors
}

function validateName(manager: PluginManager, pluginModule: PluginModule): PluginValidatorErrors {
  const errors = []

  if (!pluginModule.name || typeof pluginModule.name !== 'string') {
    errors.push(new TypeError('Invalid name'))
  }

  return errors
}

function validateApi(manager: PluginManager, pluginModule: PluginModule): PluginValidatorErrors {
  const errors = []

  if (pluginModule.api && typeof pluginModule.api !== 'function') {
    errors.push(new TypeError('Invalid api fabric type'))
  }

  return errors
}

const validateDependencyName = dependencyName => dependencyName && typeof dependencyName === 'string'

function validateDependencies(manager: PluginManager, pluginModule: PluginModule): PluginValidatorErrors {
  const errors = []

  if (pluginModule.after) {
    if (!Array.isArray(pluginModule.after)) {
      errors.push(new TypeError('Invalid after type'))
    } else if (!pluginModule.after.every(validateDependencyName)) {
      errors.push(new TypeError('Invalid after plugin name'))
    }
  }

  return errors
}

const pluginValidators: PluginValidator[] = [
  validateName,
  validateApi,
  validateDependencies,
]

export default pluginValidators
