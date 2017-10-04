import { PluginApi } from './PluginApi'
import { PluginInstance } from './PluginInstance'
import createPluginManager, { PluginManager } from './PluginManager'
// import PluginModule, { IPluginName } from './PluginModule'
import RispaConfig from './RispaConfig'

export interface IRispaContext {
  // add<T extends PluginApi<R>, R extends PluginInstance>(pluginModule: PluginModule): T
  // get<R extends PluginInstance>(name: IPluginName): R
  // has(name: IPluginName): Boolean
  start(startHandler: (this: void, context: IRispaContext) => IRispaContext): void
}

export type StartHandler = (this: void, context: RispaContext) => RispaContext

export default function create(config) {
  return new RispaContext(config)
}

export class RispaContext implements IRispaContext {
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
