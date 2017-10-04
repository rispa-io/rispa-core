import PluginInstance from './PluginInstance'
import { StartHandler } from './RispaContext'

export default interface PluginApi<R extends PluginInstance> {
  startHandler?: StartHandler,
  publicMethod?(R, arg: any): any
}
