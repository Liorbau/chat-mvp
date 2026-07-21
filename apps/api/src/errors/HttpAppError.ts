import type { ErrorCode } from './errorCodes'

export class HttpAppError extends Error {
  readonly httpStatusCode: number
  readonly code: ErrorCode
  readonly details?: unknown

  constructor(httpStatusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'HttpAppError'
    this.httpStatusCode = httpStatusCode
    this.code = code
    this.details = details
  }

  static badRequest(message: string, details?: unknown): HttpAppError {
    return new HttpAppError(400, 'VALIDATION_ERROR', message, details)
  }

  static unauthorized(message: string, details?: unknown): HttpAppError {
    return new HttpAppError(401, 'UNAUTHORIZED', message, details)
  }

  static forbidden(message: string, details?: unknown): HttpAppError {
    return new HttpAppError(403, 'FORBIDDEN', message, details)
  }

  static notFound(message: string, details?: unknown): HttpAppError {
    return new HttpAppError(404, 'RESOURCE_NOT_FOUND', message, details)
  }

  static conflict(code: ErrorCode, message: string, details?: unknown): HttpAppError {
    return new HttpAppError(409, code, message, details)
  }
}
