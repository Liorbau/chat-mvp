import { AppError } from '../../../../errors/AppError'

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw AppError.badRequest(`Webhook field '${field}' must be a non-empty string`)
  }
  return value
}

export function requireNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw AppError.badRequest(`Webhook field '${field}' must be a number`)
  }
  return value
}
