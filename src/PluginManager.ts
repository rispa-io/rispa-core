import * as DepGraph from 'dependency-graph'
import {RispaContext} from './RispaContext'
import {PluginInstance} from './PluginInstance'

export default function create(context: RispaContext): PluginManager {
  return new PluginManager(context)
}

export class PluginManager {
  private config: object
  private context: RispaContext
  private graph: object
  private instances: Map<String, PluginInstance>

  constructor(context: RispaContext) {
    this.context = context
    this.config = context.config

    this.graph = new DepGraph()
    this.instances = new Map()
  }

  public add(pluginModule): void {
    // add plugin with dependencies
  }

  public remove(pluginName): void {
    // assert not started
    // remove plugin from graph
  }

  public get(pluginName): PluginInstance {
    // return instance from this.instances
  }

  public has(pluginName): Boolean {
    // is plugin preset in graph
  }

  public instantiate(pluginName): PluginInstance {
    // call init function
  }

  public validate(pluginModule): [string] {
    const validators = [
      validateName,
      validateApi,
      validateDependencies,
    ]

    return validators.reduce((result, validator) => result.concat(validator(pluginModule)))
  }

  public start(pluginName): Boolean {
    // create and store plugin instance
    // place state markers
  }

  public stop(pluginName): Boolean {
    // remove
  }

  public isStarted(pluginName): Boolean {}

  public isStopped(pluginName): Boolean {}

  public build(): Boolean {
    // sort graph
  }

  public loadAll(): Boolean {
    // validate
    // build
    // add all plugins from config if not exists
    // start all not started
  }
}