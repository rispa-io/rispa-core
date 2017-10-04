import { PluginInstance } from './PluginInstance'
import { StartHandler } from './RispaContext'

export interface PluginApi<R extends PluginInstance> {
  startHandler?: StartHandler,
  publicMethod?(R, arg: any): any
}
