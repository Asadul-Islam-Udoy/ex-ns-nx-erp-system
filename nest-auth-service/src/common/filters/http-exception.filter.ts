import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let stack = '';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (
        typeof errorResponse === 'object' &&
        errorResponse !== null &&
        'message' in errorResponse
      ) {
        message = (errorResponse as { message: string | string[] }).message;
      }

      if (exception.stack) {
        stack = exception.stack;
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
      stack = exception.stack || '';
    }

    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    // ✅ Log stack safely (no TS underline)
    this.logger.error(message, stack);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
    });
  }
}
