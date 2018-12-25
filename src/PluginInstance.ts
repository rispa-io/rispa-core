import { RispaContext } from './RispaContext'

export default abstract class PluginInstance {
  context: RispaContext

  protected constructor(context?: RispaContext) {
    if (!context || !(context instanceof RispaContext)) {
      throw new TypeError('`context` must be passed in super')
    }

    this.context = context
  }

  // tslint:disable-next-line: no-empty
  public start() {}

  // tslint:disable-next-line: no-empty
  public stop() {}
}
