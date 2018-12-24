import createRispaContext, { RispaContext, StartHandler } from './RispaContext'
import PluginModule from './PluginModule'
import { readPlugins, importPluginModules, PluginInfo } from './plugins'
import createLogger from './logger'

const logger = createLogger('@rispa')

export default function init(startHandler: StartHandler): Promise<RispaContext> {
  const pluginsInfo: PluginInfo[] = readPlugins(process.cwd())

  const plugins: PluginModule[] = importPluginModules(pluginsInfo)

  const context = createRispaContext(plugins)

  return context.start(startHandler)
    .catch(error => {
      logger.error(error)

      process.exit(1)

      throw error
    })
}
