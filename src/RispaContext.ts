import createPluginManager, { PluginManager } from './PluginManager'
import RispaConfig from './RispaConfig'
import { IPluginName } from './PluginModule'
import PluginInstance from './PluginInstance'
import PluginApi from './PluginApi'

export type StartHandler = (this: void, context: RispaContext) => RispaContext | Promise<RispaContext>

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

  public get(pluginName: IPluginName): PluginApi<PluginInstance> {
    if (!pluginName || typeof pluginName !== 'string') {
      throw 'Invalid plugin name'
    }

    return this.pluginManager.get(pluginName)
  }

  public start(startHandler: StartHandler): Promise<RispaContext> {
    return this.pluginManager.loadAll()
      .then(() => startHandler(this))
  }
}
