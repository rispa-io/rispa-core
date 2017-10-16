import * as fs from 'fs-extra'
import * as path from 'path'
import PluginModule, { IPluginName } from './PluginModule'

export const importModule = <T>(id: string): any => {
  const module = require(id)

  if (!module.default) {
    module.default = module
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
  name: string,
  packageName: IPluginName,
  packageAlias: string,
  path: string,
  activator: string,
  generators: string,
}

export const readPlugins = (cwd: string): PluginInfo[] => {
  const pluginsCachePath = path.resolve(searchRootProjectDir(cwd), './build/plugins.json')

  const { plugins } = fs.readJsonSync(pluginsCachePath, { throws: false })

  if (!plugins || plugins.length === 0) {
    throw new Error('Can\'t find plugins')
  }

  return plugins
}

export const importPluginModules = (plugins: PluginInfo[]): PluginModule[] => (
  plugins.reduce((modules, plugin) => {
    if (plugin.activator) {
      const {
        default: instance,
        api,
        after = []
      } = importModule(plugin.activator)

      modules.push({
        name: api ? api.pluginName : plugin.packageName,
        path: plugin.path,
        instance,
        api,
        after,
      })
    }

    return modules
  }, [])
)
