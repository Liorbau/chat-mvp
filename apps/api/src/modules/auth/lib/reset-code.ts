import { randomInt } from 'node:crypto'
import { RESET_CODE_LENGTH } from '@chat/contract'

// Re-export the shared length so existing importers (the DTO) keep one path.
export { RESET_CODE_LENGTH }

export const RESET_CODE_TTL_MS = 10 * 60 * 1000

// Cryptographically-random numeric OTP, zero-padded to a fixed width so codes
export function generateResetCode(): string {
  const max = 10 ** RESET_CODE_LENGTH
  return randomInt(0, max).toString().padStart(RESET_CODE_LENGTH, '0')
}
