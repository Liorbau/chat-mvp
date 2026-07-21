import { RESET_CODE_TTL_MS } from './reset-code'

const RESET_CODE_TTL_MINUTES = RESET_CODE_TTL_MS / 60_000

export function buildPasswordResetMessage(code: string): { subject: string; text: string } {
  return {
    subject: 'Your password reset code',
    text: `Your password reset code is ${code}.\n\nIt expires in ${RESET_CODE_TTL_MINUTES} minutes and can only be used once. If you didn't request a password reset, you can safely ignore this email.`,
  }
}
