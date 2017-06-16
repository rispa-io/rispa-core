exports.init = command => `init:${command()}`
exports.prepare = command => `prepare:${command()}`
exports.start = command => `start:${command()}`

exports.build = () => 'build'
exports.generator = () => 'generator'
