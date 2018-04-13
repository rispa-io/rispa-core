import createPluginManager, { PluginManager } from './PluginManager'
import { IPluginName, default as PluginModule } from './PluginModule'
import PluginInstance from './PluginInstance'
import PluginApi from './PluginApi'

export type StartHandler = (this: void, context: RispaContext) => any | Promise<any>

export default function create(plugins: PluginModule[]): RispaContext {
  return new RispaContext(plugins)
}

export class RispaContext {
  public plugins: PluginModule[]

  private pluginManager: PluginManager

  constructor(plugins: PluginModule[]) {
    this.plugins = plugins
    this.pluginManager = createPluginManager(this)
  }

  public get(pluginName: IPluginName): PluginApi<PluginInstance> {
    if (!pluginName || typeof pluginName !== 'string') {
      throw 'Invalid plugin name'
    }

    return this.pluginManager.get(pluginName)
  }

  public start(startHandler: StartHandler): Promise<any> | any {
    this.pluginManager.loadAll()

    return startHandler(this)
  }
}
