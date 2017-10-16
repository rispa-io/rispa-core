# Plugin specification

To create new plug-ins that are integrated into the project using `rispa`, you need the following:

 - Package should be identified as plugin for `rispa`, identification is carried out as follows 
   * `package.json` should contain key `"rispa:name": "plugin-name"`, where `plugin-name` is treated as an alias of the package full name specified in the key `"name"`
   * package defined in scope `@rispa` 
 - Package may declare a configuration file use key `"rispa:activator": "./relative/path/to/activator.js"`
   * File should exists, if file was not found error will be raised
   * The file will be processed during the initialization of any command executed in the context of the plugins `rispa`
   * If no such file is specified, the package simply remains as a passive dependency in the project
 - Activator should implement interface `Plugin`
   * `{ new(context: RispaContext): PluginInstance }` - default export of activator module, should return plugin instance constructor
   * `api` - named export. This constructor create instance, describes a public api for interacting with the plugin
   * `after` - named export. Describes the dependencies between plugins. Here are the names of the plugins, which must be initialized before the plugin starts working. It is assumed that there is a dependency graph, the cycles are blocked at initialization
 - The public API of the plugin must be accessible through the import of `plugin-name` and coincide with that specified in the activator
 - The plugin instance will implement the internal logic of the plugin. The method of pairing with api is not regulated and remains on the developer of the plugin, that is, there are no requirements for the matching of method names.
 - All plug-ins provide for import code ready for execution, without the use of additional means of transpiration.

## Plugin example
`@application/plugin-name/package.json`

```json
{
  "name": "plugin-name",
  "rispa:name": "pn",
  "rispa:activator": "./lib/activator.js",
  "rispa:generators": "./generators.js"
}
```

`@application/plugin-name/src/activator.js`

```typescript
import { RispaContext, PluginInstance, PluginApi } from '@rispa/core'
import EventBusApi from '@rispa/events'
import ConfigApi from '@rispa/config'

export default class PluginNameInstance implements PluginInstance {
  config: object
  context: RispaContext
  eventBus: EventBusApi
  unsubscribe: Function
  
  constructor(context: RispaContext) {
    super(context)
    
    this.config = context.get(ConfigApi.pluginName).getConfig()
    this.eventBus = this.context.get(EventBusApi.pluginName)
  }
  
  public start() {
    this.eventBus.on('event:name', this.handleEvent)
  }
  
  public someMethod(name, value) {}
  
  private handleEvent() {}
}

class PluginNameApi extends PluginApi<PluginNameInstance> {
  static pluginName = 'plugin-name'
  
  someMethod(name, value) {
    this.instance.someMethod(name, value)
  }
}

export const api = PluginNameApi

export const after = [EventBusApi.pluginName, ConfigApi.pluginName]
```
