/**
 * Service for handling various types of exceptions in the application.
 */
import {
  Injectable,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IException,
  IFormatExceptionMessage,
} from '../../domain/exceptions/exceptions.interface';

@Injectable()
export class ExceptionsService implements IException {
  /**
   * Throws a BadRequestException with the provided format exception message.
   * @param data The format exception message.
   */
  private throwException(
    exception: any,
    message?: IFormatExceptionMessage,
  ): void {
    if (message) {
      throw new exception(message, HttpStatus.BAD_REQUEST);
    } else {
      throw new exception();
    }
  }

  /**
   * Throws a BadRequestException with the provided format exception message.
   * @param data The format exception message.
   */
  badRequestException(data: IFormatExceptionMessage): void {
    this.throwException(BadRequestException, data);
  }

  /**
   * Throws an InternalServerErrorException with the optional format exception message.
   * @param data The format exception message (optional).
   */
  internalServerErrorException(data?: IFormatExceptionMessage): void {
    this.throwException(InternalServerErrorException, data);
  }

  /**
   * Throws a ForbiddenException with the optional format exception message.
   * @param data The format exception message (optional).
   */
  forbiddenException(data?: IFormatExceptionMessage): void {
    this.throwException(ForbiddenException, data);
  }

  /**
   * Throws an UnauthorizedException with the optional format exception message.
   * @param data The format exception message (optional).
   */
  unauthorizedException(data?: IFormatExceptionMessage): void {
    this.throwException(UnauthorizedException, data);
  }
}
