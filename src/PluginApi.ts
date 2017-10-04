import PluginInstance from './PluginInstance'
import { StartHandler } from './RispaContext'
import { IPluginName } from './PluginModule'

export type PublicMethod<R> = (instance: R, ...args: any[]) => any

type PluginApi<R extends PluginInstance> = {
  [key: string]: PublicMethod<R> | IPluginName | StartHandler

  pluginName: IPluginName

  startHandler?: StartHandler
}

export default PluginApi
