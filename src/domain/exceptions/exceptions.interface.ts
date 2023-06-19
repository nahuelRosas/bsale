export interface IFormatExceptionMessage {
  message: string;
  code_error?: number;
}

export interface IException {
  /**
   * Throws a Bad Request exception with the specified format message.
   * @param data The format message for the exception.
   */
  badRequestException(data: IFormatExceptionMessage): void;

  /**
   * Throws an Internal Server Error exception with the specified format message.
   * @param data The format message for the exception.
   */
  internalServerErrorException(data?: IFormatExceptionMessage): void;

  /**
   * Throws a Forbidden exception with the specified format message.
   * @param data The format message for the exception.
   */
  forbiddenException(data?: IFormatExceptionMessage): void;

  /**
   * Throws an Unauthorized exception with the specified format message.
   * @param data The format message for the exception.
   */
  unauthorizedException(data?: IFormatExceptionMessage): void;
}
