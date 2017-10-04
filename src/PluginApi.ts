import PluginInstance from './PluginInstance'
import { StartHandler } from './RispaContext'
import { IPluginName } from './PluginModule'

type PublicMethod<R> = (instance: R, ...args: any[]) => any

export default interface PluginApi<R extends PluginInstance> {
  [key: string]: PublicMethod<R> | IPluginName | StartHandler;

  pluginName: IPluginName;

  startHandler?: StartHandler;
}
