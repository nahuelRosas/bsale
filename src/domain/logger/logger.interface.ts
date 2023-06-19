export interface ILogger {
  /**
   * Logs a debug message.
   * @param context The context or module name for the log.
   * @param message The log message.
   */
  debug(context: string, message: string): void;

  /**
   * Logs an informational message.
   * @param context The context or module name for the log.
   * @param message The log message.
   */
  log(context: string, message: string): void;

  /**
   * Logs an error message.
   * @param context The context or module name for the log.
   * @param message The error message.
   * @param trace (optional) The error stack trace.
   */
  error(context: string, message: string, trace?: string): void;

  /**
   * Logs a warning message.
   * @param context The context or module name for the log.
   * @param message The warning message.
   */
  warn(context: string, message: string): void;

  /**
   * Logs a verbose message.
   * @param context The context or module name for the log.
   * @param message The log message.
   */
  verbose(context: string, message: string): void;
}
