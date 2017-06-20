const { generator: generatorEvent } = require('./events')
const path = require('path')
const fs = require('fs')
const core = require('./index')

module.exports = plop => {
  core(generatorEvent(), plop)

  const featureList =
    fs.readdirSync('../')
      .map(feature => ({ name: feature, value: feature }))

  const generators = plop.getGeneratorList()

  generators.forEach(({ name }) => {
    const generator = plop.getGenerator(name)

    if (generator.name !== 'feature-plugin') {
      generator.prompts.unshift({
        type: 'list',
        name: 'featureName',
        message: 'What feature do you want to add a template to?',
        choices: featureList,
      })
    } else {
      generator.prompts.unshift({
        type: 'input',
        name: 'featureName',
        message: 'Please type feature plugin name',
      })
    }

    const actions = generator.actions

    generator.actions = data => {
      const actionsArray = typeof actions === 'function' ? actions(data) : actions

      return actionsArray.map(action => {
        const config = typeof action === 'function' ? action(data) : action
        const destFolder = path.resolve(__dirname, `../${data.featureName}`).replace(/\\/g, '/')
        config.path = `${destFolder}/${config.path}`
        return config
      })
    }
  })
}
