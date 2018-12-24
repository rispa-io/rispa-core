import makeLogger, { LoggerOptions, Logger as BaseLogger, colors } from '@fyzu/logger'

export const LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as LoggerOptions['level']

export interface Logger extends BaseLogger {
  colors: typeof colors,
}

export default function createLogger(name: string): Logger {
  const logger = makeLogger({
    level: LOG_LEVEL,
    name,
  }) as Logger

  logger.colors = colors

  return logger
}
