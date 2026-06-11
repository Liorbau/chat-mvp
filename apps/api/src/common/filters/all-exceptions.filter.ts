import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import type { Response } from 'express'
import { AppError } from '../../errors/AppError'
import type { ApiErrorBody } from '../errors/error-envelope.types'
import { toApiErrorBody } from '../errors/to-api-error-body'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()

    if (exception instanceof AppError) {
      response.status(exception.statusCode).json(this.fromAppError(exception))
      return
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus()
      response.status(statusCode).json(toApiErrorBody(statusCode, exception.getResponse()))
      return
    }

    console.error('Unhandled exception:', exception)
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: { code: 'INTERNAL', message: 'Internal server error' },
    })
  }

  private fromAppError(error: AppError): ApiErrorBody {
    const base = { code: error.code, message: error.message }
    return { error: error.details === undefined ? base : { ...base, details: error.details } }
  }
}
