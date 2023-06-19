import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Intercepts the incoming request and logs information.
   * @param context The execution context.
   * @param next The next call handler.
   * @returns An observable with the response.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const { getRequest } = context.switchToHttp();
    const request = getRequest();
    const { path, method } = request;
    const ip = this.getIP(request);

    this.logger.log(`Incoming Request on ${path}`, `method=${method} ip=${ip}`);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `End Request for ${path}`,
          `method=${method} ip=${ip} duration=${Date.now() - now}ms`,
        );
      }),
    );
  }

  private getIP(request: any): string {
    return request.ip.replace('::ffff:', '');
  }
}
