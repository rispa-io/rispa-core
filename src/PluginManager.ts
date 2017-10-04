import { DepGraph } from 'dependency-graph'
import { RispaContext } from './RispaContext'
import PluginInstance from './PluginInstance'
import PluginModule, { IPluginName } from './PluginModule'
import RispaConfig from './RispaConfig'

export default function create(context: RispaContext): PluginManager {
  return new PluginManager(context)
}

export class PluginManager {
  private config: RispaConfig
  private context: RispaContext
  private graph: DepGraph<PluginModule>
  private instances: Map<IPluginName, PluginInstance>

  constructor(context: RispaContext) {
    this.context = context
    this.config = context.config

    this.graph = new DepGraph()
    this.instances = new Map()
  }

  /*
    Add plugin with dependencies
   */
  public add(pluginModule: PluginModule): void {
    if (!this.has(pluginModule.name)) {
      this.graph.addNode(pluginModule.name as string, pluginModule)

      if (pluginModule.after) {
        pluginModule.after.forEach(dependencyName => {
          this.graph.addDependency(
            pluginModule.name as string,
            dependencyName as string,
          )
        })
      }
    }
  }

  /*
    Remove plugin

    Throws if not started
   */
  public remove(pluginName: IPluginName): void {
    // assert not started
    // remove plugin from graph

    if (this.isStarted(pluginName)) {
      throw 'Can\'t remove started plugin'
    }

    this.graph.removeNode(pluginName as string)
  }

  /*
    Get plugin
   */
  public get(pluginName: IPluginName): PluginInstance {
    return this.instances.get(pluginName)
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
    // call init function
    const pluginModule = this.graph.getNodeData(pluginName as string)

    return pluginModule.init(this.context, this.config)
  }

  /*
    Validate plugin
   */
  public validate(pluginModule): [string] {
    const validators = [
      // validateName,
      // validateApi,
      // validateDependencies,
    ]

    return validators.reduce((result, validator) => (
      result.concat(validator(this, pluginModule))
    ), [])
  }

  /*
    Create plugin instance and call start
   */
  public start(pluginName: IPluginName): void {
    if (this.isStopped(pluginName)) {
      const instance: PluginInstance = this.instantiate(pluginName)

      instance.start();

      this.instances.set(pluginName, instance)
    }
  }

  /*
    Stop started plugin
   */
  public stop(pluginName: IPluginName): void {
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
    const { plugins } = this.config

    const errors = plugins.reduce((results, pluginModule) => ([
      ...results,
      ...this.validate(pluginModule),
    ]), [])

    if (errors.length > 0) {
      throw errors
    }
  }

  private build() {
    const { plugins } = this.config

    plugins.forEach(pluginModule => {
      this.add(pluginModule)
    });
  }

  private startAll() {
    const pluginsOrder = this.graph.overallOrder()

    pluginsOrder.forEach(pluginName => {
      this.start(pluginName)
    })
  }

  public async loadAll(): Promise<RispaContext> {
    // validate
    this.validateAll()

    // build
    this.build()

    // start all not started
    this.startAll()

    return this.context
  }
}
