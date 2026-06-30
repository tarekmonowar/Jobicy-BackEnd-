// Maps any thrown error to the standard { success: false, error: {...} } envelope.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@/generated/prisma';
import { Response } from 'express';
import { ERRORS } from '@/common/constants/error-codes';

interface ErrorBody {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const body = this.buildErrorBody(exception);
    const status = body.statusCode;

    if (status >= ERRORS.INTERNAL_ERROR.statusCode) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      error: body,
    });
  }

  /** Normalize HttpException, Prisma errors, and unknown throws into one shape. */
  private buildErrorBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }

    return {
      code: ERRORS.INTERNAL_ERROR.code,
      message: ERRORS.INTERNAL_ERROR.message,
      statusCode: ERRORS.INTERNAL_ERROR.statusCode,
    };
  }

  /** Extract code/message from our appError() shape or Nest validation responses. */
  private fromHttpException(exception: HttpException): ErrorBody {
    const status = exception.getStatus();
    const raw = exception.getResponse();

    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>;

      if (typeof obj.code === 'string' && typeof obj.message === 'string') {
        return {
          code: obj.code,
          message: obj.message,
          statusCode: (obj.statusCode as number) ?? status,
          details: obj.details,
        };
      }

      // class-validator ValidationPipe response: { message: string[], error: 'Bad Request' }
      if (Array.isArray(obj.message)) {
        return {
          code: ERRORS.VALIDATION_ERROR.code,
          message: ERRORS.VALIDATION_ERROR.message,
          statusCode: ERRORS.VALIDATION_ERROR.statusCode,
          details: obj.message,
        };
      }
    }

    const message =
      typeof raw === 'string'
        ? raw
        : exception.message || ERRORS.INTERNAL_ERROR.message;

    return {
      code: this.statusToCode(status),
      message,
      statusCode: status,
    };
  }

  /** Map Prisma unique-constraint violations to 409 conflict responses. */
  private fromPrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): ErrorBody {
    if (error.code === 'P2002') {
      return {
        code: ERRORS.EMAIL_IN_USE.code,
        message: 'A record with this value already exists',
        statusCode: 409,
      };
    }

    return {
      code: ERRORS.INTERNAL_ERROR.code,
      message: ERRORS.INTERNAL_ERROR.message,
      statusCode: ERRORS.INTERNAL_ERROR.statusCode,
    };
  }

  private statusToCode(status: number): string {
    const entry = Object.values(ERRORS).find((e) => e.statusCode === status);
    return entry?.code ?? ERRORS.INTERNAL_ERROR.code;
  }
}
