import { Injectable, Logger } from '@nestjs/common';
import { ILogger } from '../../domain/logger/logger.interface';

@Injectable()
export class LoggerService extends Logger implements ILogger {
  constructor() {
    super();
    if (process.env.NODE_ENV === 'production') {
      this.debug = this.noop;
      this.verbose = this.noop;
    }
  }

  /**
   * Log a debug message.
   * @param context The log message context.
   * @param message The log message.
   */
  debug(context: string, message: string) {
    if (process.env.NODE_ENV !== 'production') {
      super.debug(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Log an informational message.
   * @param context The log message context.
   * @param message The log message.
   */
  log(context: string, message: string) {
    super.log(`[INFO] ${message}`, context);
  }

  /**
   * Log an error message.
   * @param context The log message context.
   * @param message The log message.
   * @param trace An optional error trace.
   */
  error(context: string, message: string, trace?: string) {
    super.error(`[ERROR] ${message}`, trace, context);
  }

  /**
   * Log a warning message.
   * @param context The log message context.
   * @param message The log message.
   */
  warn(context: string, message: string) {
    super.warn(`[WARN] ${message}`, context);
  }

  /**
   * Log a verbose message.
   * @param context The log message context.
   * @param message The log message.
   */
  verbose(context: string, message: string) {
    if (process.env.NODE_ENV !== 'production') {
      super.verbose(`[VERBOSE] ${message}`, context);
    }
  }

  private noop() {
    // No operation
  }
}
