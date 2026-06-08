import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError'
import { ErrorCode } from '../errors/errorCodes'

type ApiErrorBody = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

type BodyParserError = {
  status?: number
  type?: string
}

function isBodyParserError(error: unknown): error is BodyParserError {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  return 'status' in error || 'type' in error
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  void _next
  if (error instanceof AppError) {
    const body: ApiErrorBody = {
      error:
        error.details === undefined
          ? { code: error.code, message: error.message }
          : { code: error.code, message: error.message, details: error.details },
    }
    response.status(error.statusCode).json(body)
    return
  }

  if (isBodyParserError(error)) {
    if (error.type === 'entity.parse.failed') {
      response.status(400).json({
        error: { code: ErrorCode.VALIDATION_ERROR, message: 'Invalid JSON body' },
      })
      return
    }
    if (error.type === 'entity.too.large' || error.status === 413) {
      response.status(413).json({
        error: { code: ErrorCode.VALIDATION_ERROR, message: 'Request body too large' },
      })
      return
    }
  }

  console.error('Unhandled error:', error)
  const body: ApiErrorBody = {
    error: { code: ErrorCode.INTERNAL, message: 'Internal server error' },
  }
  response.status(500).json(body)
}
