import { init, prepare, start, build, generator } from '../events'

describe('events', () => {
  it('should format', () => {
    expect(init(build)).toBe('init:build')
    expect(prepare(generator)).toBe('prepare:generator')
    expect(start(generator)).toBe('start:generator')
  })
})
