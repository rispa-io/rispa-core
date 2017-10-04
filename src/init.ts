import createRispaContext, {RispaContext, StartHandler} from './RispaContext'
import RispaConfig from './RispaConfig'
import {readPluginsCache} from '../scanActivators'
import PluginModule from './PluginModule'

function readConfig(): RispaConfig {
  const path: string = process.cwd()

  const config: RispaConfig = readPluginsCache(path)
  if (!config || !config.plugins) {
    throw new Error('Invalid rispa config')
  }

  return config
}

export type InitOptions = {
  require: RispaConfig['require'],
}

function mapPlugins(config: RispaConfig, opts: InitOptions): PluginModule[] {
  return Object.values(config.plugins)
    .reduce((modules, plugin) => {
      if (plugin.activator) {
        const {default: init, after} = opts.require(plugin.activator)

        modules.push({
          name: plugin.name,
          init,
          after,
        })
      }

      return modules
    }, [])
}

export default function init(startHandler: StartHandler, opts: InitOptions): Promise<RispaContext> {
  opts.require = opts.require || require

  const config: RispaConfig = {
    startHandler,
    plugins: mapPlugins(readConfig(), opts),
    ...opts,
  }

  const context = createRispaContext(config)

  return context.start(startHandler)
}
