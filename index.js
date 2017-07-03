const babelConfig = require('./babel.js')

require('babel-register')(babelConfig)

const { default: init } = require('./init')

module.exports = init
