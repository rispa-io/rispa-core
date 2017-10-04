import createRispaContext, { RispaContext, StartHandler } from './RispaContext'
import RispaConfig from './RispaConfig'
import { readPlugins } from './readPlugins'

export type InitOptions = {
  require: RispaConfig['require'],
}

const defaultOptions: InitOptions = {
  require: id => {
    const module = require(id)

    if (!module.default) {
      module.default = module
    }

    return module
  },
}

export default function init(startHandler: StartHandler, opts: InitOptions = defaultOptions): Promise<RispaContext> {
  opts.require = opts.require || defaultOptions.require

  const config: RispaConfig = {
    plugins: readPlugins(process.cwd(), opts),
    ...opts,
  }

  const context = createRispaContext(config)

  return context.start(startHandler)
}
