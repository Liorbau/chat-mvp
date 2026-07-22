import { ApiRequestError } from '@/api'

// Maps any thrown value to user-facing message(s). `statusMessages` supplies
// per-status overrides (e.g. { 401: 'Invalid email or password.' }); otherwise
// 400 validation details are surfaced, then the error message, then a fallback.
export function toApiErrorMessages(
  error: unknown,
  statusMessages: Record<number, string> = {},
): string[] {
  if (error instanceof ApiRequestError) {
    const override = statusMessages[error.status]
    if (override) {
      return [override]
    }
    if (error.status === 400 && Array.isArray(error.details)) {
      const messages = error.details.filter(
        (detail): detail is string => typeof detail === 'string',
      )
      if (messages.length > 0) {
        return messages
      }
    }
    return [error.message]
  }
  if (error instanceof Error) {
    return [error.message]
  }

  return ['Something went wrong. Please try again.']
}
