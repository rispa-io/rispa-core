import { RispaContext } from './RispaContext'
import RispaConfig from './RispaConfig'

export default abstract class PluginInstance {
  context: RispaContext
  config: RispaConfig

  constructor(context: RispaContext, config: RispaConfig) {
    this.context = context
    this.config = config
  }

  public start() {
  }

  public stop() {
  }
}
