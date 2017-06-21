# Rispa app template

## Technologies
Generated app uses the following technologies:
* React
* Redux
* [React Router v4](https://reacttraining.com/react-router/)
* Server side rendering with [universal-webpack](https://github.com/halt-hammerzeit/universal-webpack)
* Code Splitting with [react-loadable](https://github.com/thejameskyle/react-loadable) and [webpack-flushchunks](https://github.com/faceyspacey/webpack-flush-chunks)
* CSS Modules and Sugarss
* Express
* Webpack for bundling
* Webpack Dev Middleware
* Webpack Hot Middleware
* Babel
* ESlint
* Jest for testing
* Storybook with storyshots


## App structure
App based on Lerna monorepo structure. It consists of plugins of two types: system plugins (rispa plugins) and project plugins (features). It has following structure:

```
.
├── build
├── packages
│   ├── rispa-core
│   ├── rispa-client
│   ├── rispa-config
│   ├── rispa-redux
│   ├── rispa-server
│   ├── rispa-render-server
│   ├── rispa-routes
│   ├── rispa-ui-kit
│   ├── rispa-vendor
│   ├── rispa-webpack
│   …
│   ├── feature-plugin
│   │   └── src
│   │   │   ├── components
│   │   │   │   └── Component
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── Component.js
│   │   │   │   │   ├── Component.sss
│   │   │   │   │   ├── Component.test.js
│   │   │   ├── containers
│   │   │   │   └── Container
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── Container.js
│   │   │   │   │   ├── Container.test.js
│   │   │   ├── redux
│   │   │   │   └── reducer.js
│   │   │   ├── index.js
│   │   │   ├── register.js
│   │   └── package.json
│   ...
├── rispa.json
├── lerna.json
└──  package.json
```

#### List of rispa plugins:

Plugin name           |Description
----------------------|-----------
rispa&#x2011;core          |Provides functionality of communicating plugins with each others
rispa&#x2011;config        |Contains configuration settings (host and port for server, outputPath and publicPath for build)
rispa&#x2011;server        |Runs express server and rendering through extension point
rispa&#x2011;render&#x2011;server |Implement server-side rendering using universal-webpack
rispa&#x2011;client        | Entry point for client app. <ul><li>configures store</li><li>creates tree with root components: AppContainer (hot reloading), Provider (redux), CookieProvider, ConnectedRouter (rr4)</li><li>inject routes get from rispa-routes plugin to the component tree</li><li>register React Hot Loader</li></ul>
rispa&#x2011;routes        |This plugin is a extension point for whole app. It gathers async routes from other plugins and register then in a global Switch, which rispa-client plugin injects into components tree
rispa&#x2011;redux         |Contains functions for configuring store and helpers for creating reducers (hor) and data loading (when)
rispa&#x2011;ui&#x2011;kit        |App ui kit
rispa&#x2011;vendor        |Contains bunch of vendor libs used by other plugins
rispa&#x2011;webpack       |Makes build for dev server and production


## Running the App
To start work you should install rispa-cli globally. It provides command to run and maintain app:

```
yarn global add rispa-cli
```
or
```
npm install -g rispa-cli
```

We use yarn as a package manager by default. To switch to npm you may change it in the lerna configuration (lerna.json)

Each plugin has its own commands which you can run in project root using following syntax:
```
ris [pluginName] [commandName]
```

`pluginName` - a plugin name (`name` property in the `package.json`) or it’s alias (`rispa:name` property in the `package.json`)
`commandName` - one of the scripts of `package.json` of the plugin

`pluginName` and `commandName` are optional. If you omit them command will allow to pick plugin or command from the list

Full list of command for each plugin you can see on [github](https://github.com/rispa-io). Main commands are in the table below:

Command|Description
-------|-----------
`ris server start-dev`|Builds and runs app dev server
`ris server start-prod`|Runs app server for production
`ris server start-dev-client`|Builds and runs app dev server with SSR disabled
`ris server start-prod-client`|Runs app server for production with SSR disabled
`ris server start-profile`|Builds and runs app dev server with profiling components cache
`ris webpack build`|Builds app for production
`ris ui sb`|Runs storybook
`ris ui build-storybook`|Builds and runs storybook for production
`ris all test`, `ris all test:coverage`|Runs tests for all plugins
`ris all lint`, `ris all lint:fix`|Runs eslint for all plugins
`ris all stylelint`|Runs stylelint for all plugins
`ris core g`|Runs modules generator

Note: To run app for production you should run commands `ris webpack build` and `ris server start-prod` one by one

## Developing
It is assumed that the functionality of the application is divided into several features. Each feature is a part of the application that has its own route. For example, Home Page or About Page are individual features that have their own route.
To add a new feature, you should create a plugin. To do this, you can use the generator by following command:
```
ris core g
```
Then pick `feature-plugin` in the list and specify the name. The plugin will be added to the `packages` folder and will have the following structure:
```
.
├── feature-plugin
│   └── src
│   │   ├── index.js
│   │   ├── register.js
│   ├── package.json
```
`index.js` specified as a `main` property in the `package.json` of the plugin. It exports the function which should return the config for router (object which contains `path` and `component` properties).


<pre>
import { Loadable } from '@rispa/vendor/loadable'

const loadable = (store, when) => Loadable({
  LoadingComponent: () => null,
  loader: () => import('./register'),
  resolveModule: module => module(store, when),
  webpackRequireWeakId: () => require.resolveWeak('./register'),
})

const createRoute = (store, when) => ({
  path: '<b>/path</b>',
  component: loadable(store, when),
})

export default createRoute
</pre>

We use Loadable for code splitting and async loading chunks.

`register.js` exports the function which accepts `store` and `when` parameters for injecting reducers or registering data loading for plugin. Function should return the component which will be displayed for specified route:

```
import Component from './components/Component/'
import reducer, { action } from './redux/reducer'
import { when, match } from '@rispa/redux/when'

const registerReducer = (store) => {
  store.injectReducer('reducerName', reducer)
}

const registerWhen = (when) => {
  when(match('/path'), () => action(), true)
}

const registerModule = (store, when) => {
  registerReducer(store)
  registerWhen(when)

  return Component
}

export default registerModule
```


After you create a plugin you should register it in the rispa-routes plugin. First of all add your plugin as a dependency for rispa-routes in its package.json:

<pre>
{
  "name": "@rispa/routes",
  "version": "0.1.0",
  "description": "rispa routes",
  "devDependencies": {
    "@rispa/eslint-config": "^1.0.0"
  },
  "dependencies": {
    <b>"feature-plugin": "^0.1.0",</b>
    "react-router-dom": "^4.1.1",
    "react": "15.5.4",
    "react-dom": "15.5.4"
  }
}
</pre>


Then add `require('feature-plugin')` to modules array in the `index.js` of the `rispa-routes` plugin:

<pre>
import React from 'react'
import { Switch, Route } from 'react-router-dom'

const getRoutes = (store, when) => {
  /* eslint-disable global-require */
  const modules = [
    <b>require('feature-plugin')</b>
    // $$ ADD HERE ~~ Do not remove
  ]

  const routes = modules
    .map(module => module(store, when))
    .filter(Boolean)

  return (
    <Switch>
      {routes.map(params => <Route key={params.path} {...params} />)}
    </Switch>
  )
}

export default getRoutes
</pre>

