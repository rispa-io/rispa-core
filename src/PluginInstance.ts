import { RispaContext } from './RispaContext'

export default abstract class PluginInstance {
  context: RispaContext

  constructor(context?: RispaContext) {
    if (!context || !(context instanceof RispaContext)) {
      throw new TypeError('`context` must be passed in super')
    }

    this.context = context
  }

  public start() {
  }

  public stop() {
  }
}
