import type { ErrorCode } from './errorCodes'

type AppErrorOptions = {
  details?: unknown
  status?: number
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly details?: unknown
  readonly status: number | undefined

  constructor(code: ErrorCode, message: string, options?: AppErrorOptions) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = options?.details
    this.status = options?.status
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError('VALIDATION_ERROR', message, { details })
  }

  static unauthorized(message: string, details?: unknown): AppError {
    return new AppError('UNAUTHORIZED', message, { details })
  }

  static forbidden(message: string, details?: unknown): AppError {
    return new AppError('FORBIDDEN', message, { details })
  }

  static notFound(message: string, details?: unknown): AppError {
    return new AppError('RESOURCE_NOT_FOUND', message, { details })
  }

  static conflict(code: ErrorCode, message: string, details?: unknown): AppError {
    return new AppError(code, message, { details })
  }
}
