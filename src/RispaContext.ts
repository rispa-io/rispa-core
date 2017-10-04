import createPluginManager, { PluginManager } from './PluginManager'
import RispaConfig from './RispaConfig'

export type StartHandler = (this: void, context: RispaContext) => RispaContext

export default function create(config) {
  return new RispaContext(config)
}

export class RispaContext {
  public config: RispaConfig
  private pluginManager: PluginManager

  constructor(config: RispaConfig) {
    this.config = config
    this.pluginManager = createPluginManager(this)
  }

  public start(startHandler: StartHandler): Promise<RispaContext> {
    this.pluginManager.loadAll() // may be initialization separate by promise.then later

    return Promise.resolve(this).then(startHandler)
  }
}
