import {PluginApi} from './PluginApi'
import {PluginInstance} from './PluginInstance'
import createPluginManager, {PluginManager} from './PluginManager'

export interface IPluginName extends String{}

export interface IRispaContext {
  add<T extends PluginApi<R>, R extends PluginInstance>(name: IPluginName): T
  get<R extends PluginInstance>(name: IPluginName): R
  has(name: IPluginName): Boolean
  start(startHandler: (this: void, context: IRispaContext) => IRispaContext): void
}

export default function create(config) {
  return new RispaContext(config)
}

export class RispaContext implements IRispaContext {
  public config: object
  private pluginManager: PluginManager

  constructor(config) {
    this.config = config
    this.pluginManager = createPluginManager(this)
  }

  public start(startHandler: (this: void, context: RispaContext) => RispaContext): Promise<RispaContext> {
    this.pluginManager.loadAll() // may be initialization separate by promise.then later

    return Promise.resolve(this).then(startHandler)
  }
}