const getBabelrcConfig = require('./babel.js')

require('babel-register')(getBabelrcConfig())

module.exports = require('./init')
