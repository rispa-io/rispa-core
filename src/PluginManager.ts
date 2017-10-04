import * as DepGraph from 'dependency-graph'
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
  private graph: DepGraph<PluginInstance>
  private started: IPluginName[]

  constructor(context: RispaContext) {
    this.context = context
    this.config = context.config

    this.graph = new DepGraph()
    this.started = []
  }

  public add(pluginModule: PluginModule): void {
    // add plugin with dependencies
  }

  public remove(pluginName: IPluginName): void {
    // assert not started
    // remove plugin from graph
  }

  public get(pluginName: IPluginName): PluginInstance {
    return this.graph.getNode(pluginName)
  }

  public has(pluginName: IPluginName): boolean {
    return this.graph.hasNode(pluginName)
  }

  public instantiate(pluginName: IPluginName): PluginInstance {
    // call init function

    return null
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
      this.get(pluginName).start();

      this.started = [...this.started, pluginName]
    }
  }

  public stop(pluginName: IPluginName): void {
    // remove

    if (this.isStarted(pluginName)) {
      this.get(pluginName).stop()

      this.started = this.started.filter(name => name !== pluginName)
    }
  }

  public isStarted(pluginName: IPluginName): boolean {
    return this.started.indexOf(pluginName) !== -1
  }

  public isStopped(pluginName: IPluginName): boolean {
    return !this.isStarted(pluginName)
  }

  public build(): boolean {
    // sort graph

    return true
  }

  public loadAll(): boolean {
    const { plugins } = this.config

    // validate

    // build
    this.build()

    // add all plugins from config if not exists
    plugins.forEach(({ name, init, after }) => {
      if (!this.graph.hasNode(name)) {
        const instance: PluginInstance = init(this.context, this.config)

        this.graph.addNode(name, instance)

        after.forEach(dependencyName => {
          this.graph.addDependency(name, dependencyName)
        })
      }
    });

    // start all not started
    const pluginsOrder = this.graph.overallOrder()

    pluginsOrder.forEach(pluginName => {
      this.start(pluginName)
    })

    return true
  }
}
