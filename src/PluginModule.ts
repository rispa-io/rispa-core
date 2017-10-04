import { RispaContext } from './RispaContext'
import PluginInstance from './PluginInstance'
import RispaConfig from './RispaConfig'
import PluginApi from './PluginApi'

export interface IPluginName extends String {
}

type PluginModule = {
  name: IPluginName,
  init: (context: RispaContext, config: RispaConfig) => PluginInstance
  after?: IPluginName[],
  api?: PluginApi<PluginInstance>,
}

export default PluginModule
