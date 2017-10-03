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
   * `init(context: RispaContext, config: object): PluginInstance` - default export of activator module, should return plugin instance
   * `api` - named export. This object describes a public api for interacting with the plugin, all methods must take the first instance of the plugin instance
   * `after` - named export. Describes the dependencies between plugins. Here are the names of the plugins, which must be initialized before the plugin starts working. It is assumed that there is a dependency graph, the cycles are blocked at initialization
 - The public API of the plugin must be accessible through the import of `plugin-name/api` and coincide with that specified in the activator
 - The plugin instance will implement the internal logic of the plugin. The method of pairing with api is not regulated and remains on the developer of the plugin, that is, there are no requirements for the matching of method names.
 - All plug-ins provide for import code ready for execution, without the use of additional means of transpiration.

## Plugin example
`@application/plugin-name/package.json`

```json
{
  "name": "plugin-name",
  "rispa:name": "pn",
  "rispa:activator": "lib/activator.js"
}
```

`@application/plugin-name/src/activator.js`

```typescript
import EventBus from '@rispa/events/api'

export default function init(context: RispaContext, config: object): PluginInstance {
  return new PluginNameInstance(context, config)
}

class PluginNameInstance implements PluginInstance {
  config: object
  context: RispaContext
  eventBus: EventBus.t
  unsubscribe: Function
  
  constructor(context: RispaContext, config: object) {
    this.config = config
    this.context = context
    this.eventBus = this.context.get(EventBus.name)
  }
  
  public start() {
    this.unsubscribe = EventBus.on(this.eventBus, 'event:name', this.handleEvent)
  }
  
  public stop() {
    this.unsubscribe()
  }
  
  public someMethod(name, value) {}
  
  private handleEvent() {}
}

export class PluginNameApi {
  static name = 'plugin-name'
  
  static someMethod(instance, name, value) {
    instance.someMethod(name, value)
  }
}
```

`@application/plugin-name/api.js`

```typescript
import { PluginNameApi } from './src/activator.js'

export default PluginNameApi
```