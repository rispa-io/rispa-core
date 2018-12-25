import { PluginManager } from './PluginManager'
import PluginModule from './PluginModule'

export class RispaValidateError extends Error {
  constructor(message: string, pluginModule: PluginModule) {
    const pluginInfo = pluginModule.name ? `[${pluginModule.name}] ` : ''
    const trace = `at rispa plugin (${pluginModule.path})`
    const spaces = '    '

    super(`${pluginInfo}${message}\n${spaces}${trace}`)
  }
}

export type PluginValidatorErrors = RispaValidateError[]
export type PluginValidator = (manager: PluginManager, pluginModule: PluginModule) => PluginValidatorErrors

const error = (message: string, pluginModule: PluginModule) => new RispaValidateError(message, pluginModule)

const validatePluginName = (name: any): boolean => name && typeof name === 'string'

function validateName(manager: PluginManager, pluginModule: PluginModule): PluginValidatorErrors {
  const errors = []

  if (!validatePluginName(pluginModule.name)) {
    errors.push(error('Invalid plugin name', pluginModule))
  }

  return errors
}

function validateInit(manager: PluginManager, pluginModule: PluginModule): PluginValidatorErrors {
  const errors = []

  if (!pluginModule.instance) {
    errors.push(error('Init constructor required', pluginModule))
  } else if (typeof pluginModule.instance !== 'function') {
    errors.push(error('Invalid init constructor type', pluginModule))
  }

  return errors
}

function validateApi(manager: PluginManager, pluginModule: PluginModule): PluginValidatorErrors {
  const errors = []

  if (pluginModule.api) {
    if (typeof pluginModule.api !== 'function') {
      errors.push(error('Invalid api constructor type', pluginModule))
    }

    if (!validatePluginName(pluginModule.api.pluginName)) {
      errors.push(error(`Must be define 'pluginName' for api constructor`, pluginModule))
    }
  }

  return errors
}

function validateDependencies(manager: PluginManager, pluginModule: PluginModule): PluginValidatorErrors {
  const errors = []

  if (pluginModule.after) {
    if (!Array.isArray(pluginModule.after)) {
      errors.push(error('Invalid \'after\' type', pluginModule))
    } else if (!pluginModule.after.every(validatePluginName)) {
      errors.push(error('Invalid \'after\' dependency plugin name', pluginModule))
    }
  }

  return errors
}

const pluginValidators: PluginValidator[] = [validateName, validateInit, validateApi, validateDependencies]

export default pluginValidators
