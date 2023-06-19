/**
 * The AllExceptionFilter is an exception filter in Nest.js that captures and handles all exceptions
 * that occur during the execution of an HTTP request.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

/**
 * Interface for defining the structure of an error message.
 */
interface IError {
  message: string;
  code_error: string;
}

/**
 * Catch decorator is used to specify that this filter should handle all exceptions.
 */
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Method called when an exception is caught by the filter.
   * @param exception The caught exception.
   * @param host The argument host containing the execution context.
   */
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request: any = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as IError)
        : { message: (exception as Error).message, code_error: null };

    // const responseData = {
    //   ...{
    //     statusCode: status,
    //     timestamp: new Date().toISOString(),
    //     path: request.url,
    //   },
    //   ...message,
    // };

    this.logMessage(request, message, status, exception);

    response.status(status).json({
      code: 400,
      errors: 'could not be connect to db',
    });
  }

  /**
   * Logs the error message based on the status and exception.
   * @param request The HTTP request object.
   * @param message The error message.
   * @param status The HTTP status code.
   * @param exception The caught exception.
   */
  private logMessage(
    request: any,
    message: IError,
    status: number,
    exception: any,
  ) {
    if (status === 500) {
      this.logger.error(
        `End Request for ${request.path}`,
        `method=${request.method} status=${status} code_error=${
          message.code_error ? message.code_error : null
        } message=${message.message ? message.message : null}`,
        status >= 500 ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `End Request for ${request.path}`,
        `method=${request.method} status=${status} code_error=${
          message.code_error ? message.code_error : null
        } message=${message.message ? message.message : null}`,
      );
    }
  }
}
