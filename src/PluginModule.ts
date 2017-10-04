import { RispaContext } from './RispaContext'
import { PluginInstance } from './PluginInstance'
import RispaConfig from './RispaConfig'

export interface IPluginName extends String {
}

type PluginModule = {
  name: IPluginName,
  init: (context: RispaContext, config: RispaConfig) => PluginInstance
  after?: IPluginName[],
}

export default PluginModule
