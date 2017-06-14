export const init = command => `init:${command()}`
export const prepare = command => `prepare:${command()}`
export const start = command => `start:${command()}`

export const build = () => 'build'
export const generator = () => 'generator'
