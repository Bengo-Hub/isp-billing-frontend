/**
 * Production-safe logger utility
 * 
 * Only outputs logs in development environment to avoid
 * exposing sensitive information in production.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';

function createLogger(options: LoggerOptions = {}) {
  const prefix = options.prefix ? `[${options.prefix}]` : '';

  return {
    debug: (...args: unknown[]) => {
      if (isDevelopment) {
        console.debug(prefix, ...args);
      }
    },
    info: (...args: unknown[]) => {
      if (isDevelopment) {
        console.info(prefix, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (isDevelopment) {
        console.warn(prefix, ...args);
      }
    },
    error: (...args: unknown[]) => {
      // Errors are always logged (may go to error reporting service)
      console.error(prefix, ...args);
    },
    log: (...args: unknown[]) => {
      if (isDevelopment) {
        console.log(prefix, ...args);
      }
    },
  };
}

// Pre-configured loggers for common use cases
export const logger = createLogger();
export const authLogger = createLogger({ prefix: 'Auth' });
export const apiLogger = createLogger({ prefix: 'API' });
export const storeLogger = createLogger({ prefix: 'Store' });

export { createLogger };
export type { LogLevel, LoggerOptions };

