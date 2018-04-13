import createRispaContext, { StartHandler } from './RispaContext'
import PluginModule from './PluginModule'
import { importPluginModules, PluginInfo, readPlugins } from './plugins'
import { logError } from './log'
import { isPromise } from './utils'

const handleError = error => {
  logError(error)

  process.exit(1)

  throw error
}

export default function init(startHandler: StartHandler): any | Promise<any> {
  const pluginsInfo: PluginInfo[] = readPlugins(process.cwd())

  const plugins: PluginModule[] = importPluginModules(pluginsInfo)

  const context = createRispaContext(plugins)

  try {
    const result = context.start(startHandler)
    if (result && isPromise(result)) {
      return result.catch(handleError)
    }

    return result
  } catch (error) {
    handleError(error)
  }
}
