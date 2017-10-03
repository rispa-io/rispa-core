import createRispaContext from './RispaContext'
import {readPluginsCache} from '../scanActivators.js'

const mapPlugins = (pluginsCache, opts) => {
  if (!pluginsCache || !pluginsCache.plugins) {
    return {}
  }

  return Object.keys(pluginsCache.plugins)
    .reduce((acc, plugin) => {
      acc[plugin.name] = opts.require(plugin.activator)
      return acc
    }, {})
}

export default function init(startHandler, opts) {
  opts.require = opts.require || require

  const config = {
    startHandler,
    plugins: mapPlugins(readPluginsCache(process.cwd()), opts),
    ...opts,
  }
  const context = createRispaContext(config)

  return context.start(startHandler)
}