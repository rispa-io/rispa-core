import { PluginInstance } from './PluginInstance'

export interface PluginApi<R extends PluginInstance> {
  publicMethod?(R, arg: any): any
}