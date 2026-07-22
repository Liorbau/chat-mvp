import { HttpStatus } from '@nestjs/common'
import type { ErrorCode } from '../../errors/errorCodes'

const CODE_TO_HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  RESOURCE_NOT_FOUND: HttpStatus.NOT_FOUND,
  CONVERSATION_ALREADY_EXISTS: HttpStatus.CONFLICT,
  EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
  INTERNAL: HttpStatus.INTERNAL_SERVER_ERROR,
}

export function httpStatusForCode(code: ErrorCode): number {
  return CODE_TO_HTTP_STATUS[code]
}
