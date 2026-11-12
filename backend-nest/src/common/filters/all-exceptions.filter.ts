import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorBody {
  message: string;
  errors?: string[];
}

interface MappedError {
  status: number;
  body: ErrorBody;
}

// @Catch() with no arguments catches everything, not only HttpException
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.map(exception);

    response.status(status).json(body);
  }

  private map(exception: unknown): MappedError {
    // 1. Errors we throw on purpose (NotFoundException...) and Nest's own (unknown URL, rate limit)
    if (exception instanceof HttpException) return this.fromHttpException(exception);

    // 2. Errors raised by the database layer and the body parser
    const known = this.fromKnownError(exception);
    if (known) return known;

    // 3. Anything else is a bug: log the details, tell the client nothing
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return { status: 500, body: { message: 'Internal server error' } };
  }

  private fromHttpException(exception: HttpException): MappedError {
    const status = exception.getStatus();
    const response = exception.getResponse();
    const payload =
      typeof response === 'string' ? { message: response } : (response as Record<string, unknown>);

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      return { status, body: { message: 'Too many requests, please try again later' } };
    }

    if (status >= 500) {
      this.logger.error(exception.stack);
      return { status, body: { message: 'Internal server error' } };
    }

    // Our own validation errors already carry a list
    if (Array.isArray(payload.errors)) {
      return {
        status,
        body: { message: String(payload.message ?? 'Validation failed'), errors: payload.errors.map(String) },
      };
    }

    // Messages given as an array come from other pipes that bypass our exceptionFactory
    if (Array.isArray(payload.message)) {
      return { status, body: { message: 'Validation failed', errors: payload.message.map(String) } };
    }

    const message = typeof payload.message === 'string' ? payload.message : exception.message;

    // Nest's default text for an unknown URL is "Cannot GET /x". Keep the Express wording
    if (status === HttpStatus.NOT_FOUND && /^Cannot [A-Z]+ \//.test(message)) {
      return { status, body: { message: 'Route not found' } };
    }

    return { status, body: { message } };
  }

  private fromKnownError(exception: unknown): MappedError | null {
    if (typeof exception !== 'object' || exception === null) return null;

    const error = exception as {
      name?: string;
      code?: number;
      type?: string;
      path?: string;
      keyPattern?: Record<string, unknown>;
      errors?: Record<string, { message: string }>;
    };

    // Mongoose schema validation
    if (error.name === 'ValidationError' && error.errors) {
      const errors = Object.values(error.errors).map((e) => e.message);
      return { status: 400, body: { message: 'Validation failed', errors } };
    }

    // Duplicate key (unique index)
    if (error.code === 11000) {
      const fields = Object.keys(error.keyPattern ?? {});
      const message =
        fields.length > 1
          ? 'A record with this combination already exists'
          : `${fields[0] ?? 'field'} already exists`;
      return { status: 409, body: { message } };
    }

    // A malformed ObjectId, for example
    if (error.name === 'CastError') {
      return { status: 400, body: { message: `Invalid ${error.path ?? 'value'}` } };
    }

    // Body parser errors
    if (error.type === 'entity.parse.failed') {
      return { status: 400, body: { message: 'Invalid JSON' } };
    }
    if (error.type === 'entity.too.large') {
      return { status: 413, body: { message: 'Request body too large' } };
    }

    return null;
  }
}