import * as fs from 'fs-extra'
import * as path from 'path'
import PluginModule, { IPluginName } from './PluginModule'
import RispaConfig from './RispaConfig'

export const importModule = <T>(id: string): any => {
  const module = require(id)

  if (!module.default) {
    module.default = module
  }

  return module
}

export const importModuleWithoutDefault = <T>(id: string): any => {
  const module = require(id)

  if (module.default) {
    return module.default
  }

  return module
}

export const searchForFile = (dir: string, filename: string): string => {
  let rootDir: string
  let currentDir: string = dir

  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.resolve(currentDir, `./${filename}`))) {
      rootDir = currentDir
      break
    }

    currentDir = path.dirname(currentDir)
  }

  return rootDir
}

export const searchRootProjectDir = (dir: string): string => searchForFile(dir, 'rispa.json')

export type PluginInfo = {
  name: IPluginName,
  path: string,
  activator: string,
}

export const readPlugins = (cwd: string): PluginInfo[] => {
  const pluginsCachePath = path.resolve(searchRootProjectDir(cwd), './build/plugins.json')

  const { plugins } = fs.readJsonSync(pluginsCachePath, { throws: false })

  if (!plugins || plugins.length === 0) {
    throw new Error('Can\'t find plugins')
  }

  return Object.values(plugins)
}

export const importConfig = (plugins: PluginInfo[]): RispaConfig => {
  const configPlugin: PluginInfo = plugins.find(plugin => plugin.name.endsWith('/config'))

  const config: RispaConfig = importModuleWithoutDefault(configPlugin.path)

  return config
}

export const importPluginModules = (plugins: PluginInfo[]): PluginModule[] => (
  plugins.reduce((modules, plugin) => {
    if (plugin.activator) {
      const { default: init, after, api } = importModule(plugin.activator)

      modules.push({
        name: plugin.name,
        init,
        api,
        after,
      })
    }

    return modules
  }, [])
)
