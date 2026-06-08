import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { AppError } from '../errors/AppError'

export type ValidationSource = 'body' | 'params' | 'query'

// Validates one request source against a Zod schema. On success the parsed
// (and coerced) value is stored on req.validated; read it in the controller via
// getValidated<T>. On failure throws a 400 with the Zod issues as details.
export function validate(schema: ZodType, source: ValidationSource) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request[source])
    if (!result.success) {
      throw AppError.badRequest('VALIDATION_ERROR', 'Invalid request', result.error.issues)
    }

    request.validated = {
      ...request.validated,
      [source]: result.data,
    }
    next()
  }
}

export function getValidated<T>(request: Request, source: ValidationSource = 'body'): T {
  return request.validated?.[source] as T
}
