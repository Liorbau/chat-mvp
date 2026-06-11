import type { ErrorCode } from './errorCodes'

export class AppError extends Error {
  readonly statusCode: number
  readonly code: ErrorCode
  readonly details?: unknown

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }

  static badRequest(code: ErrorCode, message: string, details?: unknown): AppError {
    return new AppError(400, code, message, details)
  }

  static unauthorized(message: string, details?: unknown): AppError {
    return new AppError(401, 'UNAUTHORIZED', message, details)
  }

  static forbidden(message: string, details?: unknown): AppError {
    return new AppError(403, 'FORBIDDEN', message, details)
  }

  static notFound(message: string, details?: unknown): AppError {
    return new AppError(404, 'RESOURCE_NOT_FOUND', message, details)
  }

  static conflict(code: ErrorCode, message: string, details?: unknown): AppError {
    return new AppError(409, code, message, details)
  }
}
