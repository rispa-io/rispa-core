import { RispaContext } from './RispaContext'

export default abstract class PluginInstance {
  context: RispaContext

  constructor(context: RispaContext) {
    this.context = context
  }

  public start() {
  }

  public stop() {
  }
}
