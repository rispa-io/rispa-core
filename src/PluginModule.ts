import { RispaContext } from './RispaContext'
import PluginInstance from './PluginInstance'
import PluginApi from './PluginApi'

export interface IPluginName extends String {
}

type PluginModule = {
  name: IPluginName,
  path: string,
  instance: {
    new(context: RispaContext): PluginInstance
  },
  api?: {
    new(instance: PluginInstance): PluginApi<PluginInstance>,
    pluginName: IPluginName
  },
  after?: IPluginName[],
}

export default PluginModule
