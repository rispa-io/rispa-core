# Rispa Core

## Overview

This package is the core of a modular project system running under rispa. Provides an interface between plug-ins and manages the expansion points. Below is a specification in accordance with which you can develop new plug-ins for this infrastructure.

## Plugin specification

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

## Features

### Plugins interaction

Interaction between plugins is carried out through the api plug-in, which in turn passes control to the instance of this plugin, which is stored in context.

```typescript
...
  constructor(context: RispaContext) {
     this.pluginInstance = context.get(PluginInstanceAPI.name)
  }
...
```

### Start handler

Sometimes it is necessary after the initialization of the context, to start some kind of process. To do this, special functions are used in the plug-in that will be called after the successful completion of the initialization. `startHandler` is a static method in plugin api

```typescript
...
  static startHandler(context) {
    const instance = context.get(WebpackPluginApi.pluginName)

    return instance.runBuild()
  }
...
```

### Project configuration

The configuration of the project and individual plug-ins is the same as the rest of the plug-ins, with one exception, the instance of this plug-in is created in the project, and the api is found separately as a dependency. And since all interaction is organized through a common plug-in of the plug-in, all other plug-ins even found as dependencies get the current configuration of the project

Configurations of individual plug-ins can be located in the configuration simply on separate keys, corresponding to their name

```
{
  'rispa-render-static': {
    'config-keys': 'for plugin render static'
  }
}
```

### Initialization process

The process of initializing plugins is as follows
 - Scanned project dependencies including packages from / packages and analyzed for compliance with the plugin specification.
 - All found plugins are sorted according to the order indicated in each plug-in in the field startAfter, loop dependencies are not allowed.
 - In accordance with this order, the instances of plugins are created
 - In accordance with the order, the method of starting all plug-ins is called
 - After the completion of this process startHandler is started, in all plug-ins where it is present
