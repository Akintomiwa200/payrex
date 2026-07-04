import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorBody = {
      status: false,
      statusCode: status,
      message: typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || exception.message,
      data: null,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    };

    if (status >= 500) {
      this.logger.error(
        `${ctx.getRequest().method} ${ctx.getRequest().url} - ${status}: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json(errorBody);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    this.logger.error(`${request.method} ${request.url} - ${status}: ${message}`, (exception as any).stack);

    response.status(status).json({
      status: false,
      statusCode: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
