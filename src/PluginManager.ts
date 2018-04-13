import { DepGraph } from 'dependency-graph'
import { RispaContext } from './RispaContext'
import PluginInstance from './PluginInstance'
import PluginModule, { IPluginName } from './PluginModule'
import PluginApi from './PluginApi'
import pluginValidators from './pluginValidators'

export default function create(context: RispaContext): PluginManager {
  return new PluginManager(context)
}

export class PluginManager {
  private readonly context: RispaContext
  private readonly graph: DepGraph<PluginModule>
  private readonly instances: Map<IPluginName, PluginInstance>
  private readonly apiInstances: Map<IPluginName, PluginApi<PluginInstance>>

  constructor(context: RispaContext) {
    this.context = context

    this.graph = new DepGraph()
    this.instances = new Map()
    this.apiInstances = new Map()
  }

  /*
    Add plugin
   */
  public add = (pluginModule: PluginModule) => {
    if (!this.has(pluginModule.name)) {
      this.graph.addNode(pluginModule.name as string, pluginModule)
    } else {
      throw `[${pluginModule.name}]: Plugin already added`
    }
  }

  /*
    Add plugin dependencies
   */
  public addDependencies = (pluginModule: PluginModule) => {
    if (pluginModule.after) {
      pluginModule.after.forEach(dependencyName => {
        this.graph.addDependency(
          pluginModule.name as string,
          dependencyName as string,
        )
      })
    }
  }

  /*
    Remove plugin

    Throws if not started
   */
  public remove = (pluginName: IPluginName) => {
    if (this.isStarted(pluginName)) {
      throw `[${pluginName}]: Can\'t remove started plugin`
    }

    this.graph.removeNode(pluginName as string)
  }

  /*
    Get plugin
   */
  public get = (pluginName: IPluginName): PluginApi<PluginInstance> => {
    const instance = this.instances.get(pluginName)
    const pluginModule = this.graph.getNodeData(pluginName as string)

    if (!instance) {
      throw `[${pluginName}]: Instance is not yet created (add this plugin to the after)`
    }

    if (!pluginModule.api) {
      throw `[${pluginName}]: Not available API`
    }

    if (this.apiInstances.has(pluginName)) {
      return this.apiInstances.get(pluginName)
    }

    const apiInstance = new pluginModule.api(instance)

    this.apiInstances.set(pluginName, apiInstance)

    return apiInstance
  }

  /*
    Has plugin
   */
  public has(pluginName: IPluginName): boolean {
    return this.graph.hasNode(pluginName as string)
  }

  /*
    Create instance
   */
  public instantiate(pluginName: IPluginName): PluginInstance {
    const pluginModule = this.graph.getNodeData(pluginName as string)

    return new pluginModule.instance(this.context)
  }

  /*
    Validate plugin
   */
  public validate(pluginModule): Array<Error | TypeError> {
    const errors = pluginValidators
      .reduce((results, validator) => ([
        ...results,
        ...validator(this, pluginModule),
      ]), [])

    return errors
  }

  /*
    Create plugin instance and call start
   */
  public start = (pluginName: IPluginName) => {
    if (this.isStopped(pluginName)) {
      const instance: PluginInstance = this.instantiate(pluginName)

      instance.start()

      this.instances.set(pluginName, instance)
    }
  }

  /*
    Stop started plugin
   */
  public stop = (pluginName: IPluginName) => {
    if (this.isStarted(pluginName)) {
      this.instances.get(pluginName).stop()

      this.instances.delete(pluginName)
    }
  }

  public isStarted(pluginName: IPluginName): boolean {
    return this.instances.has(pluginName)
  }

  public isStopped(pluginName: IPluginName): boolean {
    return !this.isStarted(pluginName)
  }

  private validateAll() {
    const { plugins } = this.context

    const errors = plugins.reduce((results, pluginModule) => ([
      ...results,
      ...this.validate(pluginModule),
    ]), [])

    if (errors.length > 0) {
      throw errors
    }
  }

  private build() {
    const { plugins } = this.context

    plugins.forEach(this.add)

    plugins.forEach(this.addDependencies)
  }

  private startAll() {
    const pluginsOrder = this.graph.overallOrder()

    pluginsOrder.forEach(this.start)
  }

  public loadAll() {
    // validate
    this.validateAll()

    // build
    this.build()

    // start all not started
    this.startAll()
  }
}
