import DepGraph from 'dependency-graph'
import { RispaContext } from './RispaContext'
import { PluginInstance } from './PluginInstance'
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

  public add(pluginModule: PluginModule): void {
    if (!this.has(pluginModule.name)) {
      this.graph.addNode(pluginModule.name as string, pluginModule)

      if (pluginModule.after) {
        pluginModule.after.forEach(dependencyName => {
          this.graph.addDependency(
            pluginModule.name as string,
            dependencyName as string
          )
        })
      }
    }
  }

  public remove(pluginName: IPluginName): void {
    // assert not started
    // remove plugin from graph

    if (this.isStarted(pluginName)) {
      throw new Error('Can\'t remove started plugin')
    }

    this.graph.removeNode(pluginName as string)
  }

  public get(pluginName: IPluginName): PluginInstance {
    return this.instances.get(pluginName)
  }

  public has(pluginName: IPluginName): boolean {
    return this.graph.hasNode(pluginName as string)
  }

  public instantiate(pluginName: IPluginName): PluginInstance {
    // call init function
    const pluginModule = this.graph.getNodeData(pluginName as string)

    return pluginModule.init(this.context, this.config)
  }

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

  public start(pluginName: IPluginName): void {
    // create and store plugin instance
    // place state markers

    if (this.isStopped(pluginName)) {
      const instance: PluginInstance = this.instantiate(pluginName)

      instance.start();

      this.instances.set(pluginName, instance)
    }
  }

  public stop(pluginName: IPluginName): void {
    // remove

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

  public build() {
    const { plugins } = this.config

    plugins.forEach(pluginModule => {
      this.add(pluginModule)
    });
  }

  public startAll() {
    const pluginsOrder = this.graph.overallOrder()

    pluginsOrder.forEach(pluginName => {
      this.start(pluginName)
    })
  }

  public loadAll() {
    // validate

    // build
    this.build()

    // start all not started
    this.startAll()
  }
}
