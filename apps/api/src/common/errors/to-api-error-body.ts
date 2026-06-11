import { HttpStatus } from '@nestjs/common'
import type { ApiErrorBody } from './error-envelope.types'
import { mapStatusToCode } from './http-status-to-code'

export function toApiErrorBody(statusCode: number, exceptionResponse: unknown): ApiErrorBody {
  const code = mapStatusToCode(statusCode)

  if (typeof exceptionResponse === 'string') {
    return { error: { code, message: exceptionResponse } }
  }

  if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
    const responseRecord = exceptionResponse as Record<string, unknown>
    const details = resolveDetails(statusCode, responseRecord.message)
    const message =
      statusCode === HttpStatus.BAD_REQUEST && Array.isArray(responseRecord.message)
        ? 'Invalid request'
        : resolveMessage(responseRecord.message)
    const resolvedCode = typeof responseRecord.code === 'string' ? responseRecord.code : code

    const error: ApiErrorBody['error'] = { code: resolvedCode, message }
    if (details !== undefined) {
      error.details = details
    }
    return { error }
  }

  return { error: { code, message: 'Request failed' } }
}

function resolveMessage(rawMessage: unknown): string {
  if (typeof rawMessage === 'string') {
    return rawMessage
  }
  if (Array.isArray(rawMessage)) {
    return rawMessage.join(', ')
  }
  return 'Request failed'
}

function resolveDetails(statusCode: number, rawMessage: unknown): unknown {
  if (statusCode === HttpStatus.BAD_REQUEST && Array.isArray(rawMessage)) {
    return rawMessage
  }
  return undefined
}
