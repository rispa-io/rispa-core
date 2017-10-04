import createRispaContext, { RispaContext, StartHandler } from './RispaContext'
import RispaConfig from './RispaConfig'
import { searchLernaDir, readPluginsCache } from './scanActivators'
import PluginModule from './PluginModule'

function readConfig(): RispaConfig {
  const path: string = searchLernaDir(process.cwd())
  const config: RispaConfig = readPluginsCache(path)

  if (!config || !config.plugins) {
    throw new Error('Invalid rispa config')
  }

  return config
}

export type InitOptions = {
  require: RispaConfig['require'],
}

const defaultOptions: InitOptions = {
  require: id => {
    const module = require(id)

    if (!module.default) {
      module.default = module
    }

    return module
  }
}

function mapPlugins(config: RispaConfig, opts: InitOptions): PluginModule[] {
  return Object.values(config.plugins)
    .reduce((modules, plugin) => {
      if (plugin.activator) {
        const { default: init, after, api } = opts.require(plugin.activator)

        modules.push({
          name: plugin.name,
          init,
          api,
          after,
        })
      }

      return modules
    }, [])
}

export default function init(startHandler: StartHandler, opts: InitOptions = defaultOptions): Promise<RispaContext> {
  opts.require = opts.require || defaultOptions.require

  const config: RispaConfig = {
    startHandler,
    plugins: mapPlugins(readConfig(), opts),
    ...opts,
  }

  const context = createRispaContext(config)

  return context.start(startHandler)
}
