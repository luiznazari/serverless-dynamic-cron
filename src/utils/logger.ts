import { stringify } from './stringify'

export enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
  SILLY,
}

const logLevel: LogLevel = process.env.ENV === 'prod' ? LogLevel.INFO : LogLevel.DEBUG

export const Logger = {
  error: (message: string, eventAttrs?: object) => {
    if (LogLevel.ERROR <= logLevel) console.error(stringify({ message, ...eventAttrs }))
  },

  warn: (message: string, eventAttrs?: object) => {
    if (LogLevel.WARN <= logLevel) console.warn(stringify({ message, ...eventAttrs }))
  },

  info: (message: string, eventAttrs?: object) => {
    if (LogLevel.INFO <= logLevel) console.info(stringify({ message, ...eventAttrs }))
  },

  debug: (message: string, eventAttrs?: object) => {
    if (LogLevel.DEBUG <= logLevel) console.debug(stringify({ message, ...eventAttrs }))
  },

  silly: (message: string, eventAttrs?: object) => {
    if (LogLevel.SILLY <= logLevel) console.debug(stringify({ message, ...eventAttrs }))
  },
}
