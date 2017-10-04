import PluginModule from './PluginModule'
import { StartHandler } from './RispaContext'

type RispaConfig = {
  startHandler: StartHandler,
  plugins: PluginModule[]
  require: (id: string) => any,
}

export default RispaConfig
