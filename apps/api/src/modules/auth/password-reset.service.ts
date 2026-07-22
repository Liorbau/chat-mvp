import { randomInt } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { RESET_CODE_LENGTH } from '@chat/contract'
import { PasswordHasher } from '../users/password-hasher.service'
import { RESET_CODE_TTL_MINUTES } from './reset-code/reset-code.constants'

@Injectable()
export class PasswordResetService {
  constructor(private readonly passwordHasher: PasswordHasher) {}

  generateCode(): string {
    const max = 10 ** RESET_CODE_LENGTH
    return randomInt(0, max).toString().padStart(RESET_CODE_LENGTH, '0')
  }

  hashCode(code: string): Promise<string> {
    return this.passwordHasher.hash(code)
  }

  verifyCode(code: string, codeHash: string): Promise<boolean> {
    return this.passwordHasher.compare(code, codeHash)
  }

  buildMessage(code: string): { subject: string; text: string } {
    return {
      subject: 'Your password reset code',
      text: `Your password reset code is ${code}.\n\nIt expires in ${RESET_CODE_TTL_MINUTES} minutes and can only be used once. If you didn't request a password reset, you can safely ignore this email.`,
    }
  }
}
