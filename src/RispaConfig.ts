import PluginModule from './PluginModule'

type RispaConfig = {
  plugins: PluginModule[]
  require: (id: string) => any,
}

export default RispaConfig
