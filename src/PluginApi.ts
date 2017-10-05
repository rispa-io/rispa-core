import PluginInstance from './PluginInstance'
import { StartHandler } from './RispaContext'
import { IPluginName } from './PluginModule'

abstract class PluginApi<TPluginInstance extends PluginInstance> {
  static pluginName: IPluginName

  static startHandler?: StartHandler

  instance: TPluginInstance

  constructor(instance: TPluginInstance) {
    this.instance = instance
  }
}

export default PluginApi
