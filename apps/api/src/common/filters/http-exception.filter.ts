import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '@cg/shared';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: Record<string, any> | undefined;

    if (exception instanceof AppError) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      
      if (typeof response === 'object' && response !== null) {
        const errorResponse = response as Record<string, any>;
        code = errorResponse.error || 'HTTP_ERROR';
        message = errorResponse.message || exception.message;
        details = errorResponse.details;
      } else {
        message = response as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = 'UNHANDLED_ERROR';
    }

    // Log the error for debugging
    if (status >= 500) {
      console.error({
        statusCode: status,
        code,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
        stack: process.env.NODE_ENV === 'development' ? (exception as Error).stack : undefined,
      });
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: (exception as Error).stack,
      }),
    });
  }
}
