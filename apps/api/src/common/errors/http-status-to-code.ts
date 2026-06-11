import { HttpStatus } from '@nestjs/common'

const statusToCode: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'RESOURCE_NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
}

export function mapStatusToCode(statusCode: number): string {
  return statusToCode[statusCode as HttpStatus] ?? 'INTERNAL'
}
