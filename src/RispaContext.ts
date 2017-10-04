import createPluginManager, { PluginManager } from './PluginManager'
import RispaConfig from './RispaConfig'
import { IPluginName } from './PluginModule'
import PluginInstance from './PluginInstance'
import { logError } from './log'

export type StartHandler = (this: void, context: RispaContext) => any

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

  public get(pluginName: IPluginName): PluginInstance {
    return this.pluginManager.get(pluginName)
  }

  public start(startHandler: StartHandler): Promise<any> {
    return this.pluginManager.loadAll()
      .then(startHandler)
      .catch(logError)
  }
}
