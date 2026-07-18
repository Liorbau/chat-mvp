import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common'
import type { Response } from 'express'
import { AppError } from '../../errors/AppError'
import type { ApiErrorBody } from '../errors/error.envelope.types'
import { toApiErrorBody } from '../errors/to.api.error.body'
import { isDuplicateKeyError } from '../mongo/is.duplicate.key.error'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter')

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()

    if (exception instanceof AppError) {
      response.status(exception.statusCode).json(this.fromAppError(exception))
      return
    }

    if (exception instanceof PayloadTooLargeException) {
      response.status(HttpStatus.BAD_REQUEST).json({
        error: { code: 'VALIDATION_ERROR', message: 'Uploaded file is too large.' },
      })
      return
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus()
      response.status(statusCode).json(toApiErrorBody(statusCode, exception.getResponse()))
      return
    }

    if (isDuplicateKeyError(exception)) {
      response.status(HttpStatus.CONFLICT).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email already exists',
        },
      })
      return
    }

    const httpErrorStatus = this.resolveHttpErrorStatus(exception)
    if (httpErrorStatus !== undefined) {
      const message = exception instanceof Error ? exception.message : 'Request failed'
      response.status(httpErrorStatus).json(toApiErrorBody(httpErrorStatus, message))
      return
    }

    this.logger.error('Unhandled exception:', exception)
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: { code: 'INTERNAL', message: 'Internal server error' },
    })
  }

  private resolveHttpErrorStatus(exception: unknown): number | undefined {
    if (typeof exception !== 'object' || exception === null) {
      return undefined
    }

    const candidate = exception as { status?: unknown; statusCode?: unknown }
    const status = typeof candidate.status === 'number' ? candidate.status : candidate.statusCode
    return typeof status === 'number' ? status : undefined
  }

  private fromAppError(error: AppError): ApiErrorBody {
    const base = { code: error.code, message: error.message }
    return { error: error.details === undefined ? base : { ...base, details: error.details } }
  }
}
