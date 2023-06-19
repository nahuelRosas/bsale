import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Class representing the formatted response structure for API responses.
 * @template T The type of the response data.
 */
export class ResponseFormat<T> {
  @ApiProperty({ description: 'Indicates if the response data is an array.' })
  isArray: boolean;

  @ApiProperty({ description: 'The request path.' })
  path: string;

  @ApiProperty({ description: 'The duration of the request in milliseconds.' })
  duration: string;

  @ApiProperty({ description: 'The HTTP request method.' })
  method: string;

  @ApiProperty({ description: 'The response data.' })
  data: T;
}

/**
 * Interceptor for formatting API responses into the defined response format.
 * @template T The type of the response data.
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  /**
   * Intercepts the API response and formats it according to the ResponseFormat.
   * @param context The execution context.
   * @param next The next call handler.
   * @returns An observable with the formatted response.
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    return next.handle().pipe(
      map((data) => ({
        data,
        isArray: Array.isArray(data),
        path: request.path,
        duration: `${Date.now() - now}ms`,
        method: request.method,
      })),
    );
  }
}
