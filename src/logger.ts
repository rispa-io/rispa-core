import logLevel, { LogLevel as BaseLogger } from 'loglevelnext'
import * as colors from 'ansi-colors'

export enum LogLevels {
  DEBUG = 'debug',
  ERROR = 'error',
  INFO = 'info',
  TRACE = 'trace',
  WARN = 'warn',
}

export interface LoggerOptions {
  timestamp?: boolean
  level?: LogLevels
  prefix?: {
    level: (options: { level: LogLevels }) => string
    template: string
  }
}

export interface Logger extends BaseLogger {
  colors: typeof colors
}

const SYMBOLS = {
  trace: colors.grey('₸'),
  debug: colors.cyan('➤'),
  info: colors.blue(colors.symbols.info),
  warn: colors.yellow(colors.symbols.warning),
  error: colors.red(colors.symbols.cross),
}

const DEFAULTS = {
  level: process.env.RISPA_LOG_LEVEL || 'info',
}

const PREFIX: LoggerOptions['prefix'] = {
  level: ({ level }) => SYMBOLS[level],
  template: `{{level}} ${colors.gray('｢{{name}}｣')}: `,
}

export default function createLogger(name: string, options: LoggerOptions = {}): Logger {
  const loggerOptions = {
    ...DEFAULTS,
    ...{
      name,
    },
    prefix: {
      ...PREFIX,
      ...options.prefix,
    },
  }

  if (options.timestamp) {
    loggerOptions.prefix.template = `[{{time}}] ${loggerOptions.prefix.template}`
  }

  const logger = logLevel.create(loggerOptions) as Logger

  logger.colors = colors

  return logger
}
