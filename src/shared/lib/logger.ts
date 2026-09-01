export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  time: string
  level: LogLevel
  message: string
  context?: unknown
}

const RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const MIN_LEVEL: LogLevel = import.meta.env.DEV ? 'debug' : 'info'
const MAX_BUFFER = 500

const buffer: LogEntry[] = []

function emit(level: LogLevel, message: string, context?: unknown): void {
  if (RANK[level] < RANK[MIN_LEVEL]) return

  const entry: LogEntry = { time: new Date().toISOString(), level, message }
  if (context !== undefined) entry.context = context

  buffer.push(entry)
  if (buffer.length > MAX_BUFFER) buffer.shift()

  const line = `[${entry.time}] ${level.toUpperCase()} ${message}`
  if (level === 'error') console.error(line, context ?? '')
  else if (level === 'warn') console.warn(line, context ?? '')
  else if (level === 'info') console.info(line, context ?? '')
  else console.debug(line, context ?? '')
}

export const logger = {
  debug: (message: string, context?: unknown) => emit('debug', message, context),
  info: (message: string, context?: unknown) => emit('info', message, context),
  warn: (message: string, context?: unknown) => emit('warn', message, context),
  error: (message: string, context?: unknown) => emit('error', message, context),
  getBuffer: (): LogEntry[] => [...buffer],
  clear: (): void => {
    buffer.length = 0
  },
}
