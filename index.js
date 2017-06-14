const getBabelrcConfig = require('./babel.js')

require('babel-register')(getBabelrcConfig())

const { default: init } = require('./init')

module.exports = init
