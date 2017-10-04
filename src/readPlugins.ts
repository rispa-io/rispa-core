import * as fs from 'fs-extra'
import * as path from 'path'
import PluginModule, { IPluginName } from './PluginModule'
import { InitOptions } from './init'

const PLUGINS_CACHE_PATH = './build/plugins.json'
const LERNA_JSON = 'lerna.json'
const PACKAGE_JSON = 'package.json'

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

export const searchLernaDir = (dir: string): string => searchForFile(dir, LERNA_JSON)

export const searchPackageDir = (dir: string): string => searchForFile(dir, PACKAGE_JSON)

export type PluginInfo = {
  name: IPluginName,
  activator: string,
}

export const readPlugins = (cwd: string, opts: InitOptions): PluginModule[]  => {
  const pluginsCachePath = path.resolve(searchLernaDir(cwd), PLUGINS_CACHE_PATH)

  const { plugins } = fs.readJsonSync(pluginsCachePath, { throws: false })

  return Object.values(plugins).reduce((modules, plugin) => {
    if (plugin.activator) {
      const { default: init, after, api } = opts.require(plugin.activator)

      modules.push({
        name: plugin.name,
        init,
        api,
        after,
      })
    }

    return modules
  }, [])
}
