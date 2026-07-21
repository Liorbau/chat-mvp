import { Injectable } from '@nestjs/common'
import type { ConfirmPasswordResetResponse } from '@chat/contract'
import { HttpAppError } from '../../../errors/HttpAppError'
import { verifyPassword } from '../../users/lib/password'
import { UsersService } from '../../users/users.service'
import { PasswordResetDbService } from '../password-reset.dbService'
import type { ConfirmPasswordResetDto } from '../dto/confirm-password-reset.dto'

// One opaque message for every failure (unknown email, no code, expired, wrong
// code, already-used) so confirm can't be used to enumerate accounts either.
const INVALID_RESET_MESSAGE = 'Invalid or expired reset code.'

@Injectable()
export class ConfirmPasswordResetOrchestrator {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetDbService: PasswordResetDbService,
  ) {}

  async execute(dto: ConfirmPasswordResetDto): Promise<ConfirmPasswordResetResponse> {
    const user = await this.usersService.findByEmail(dto.email)
    if (user === undefined) {
      throw HttpAppError.unauthorized(INVALID_RESET_MESSAGE)
    }

    const stored = await this.passwordResetDbService.findByUserId(user.id)
    if (stored === undefined || stored.expiresAt.getTime() <= Date.now()) {
      throw HttpAppError.unauthorized(INVALID_RESET_MESSAGE)
    }

    const codeMatches = await verifyPassword(dto.code, stored.codeHash)
    if (!codeMatches) {
      throw HttpAppError.unauthorized(INVALID_RESET_MESSAGE)
    }

    // Delete is the single-use gate: the atomic deleteOne yields true for exactly
    // one caller, so concurrent confirms of the same code can't both succeed.
    const consumed = await this.passwordResetDbService.deleteByUserId(user.id)
    if (!consumed) {
      throw HttpAppError.unauthorized(INVALID_RESET_MESSAGE)
    }

    await this.usersService.resetPassword(user.id, dto.newPassword)
    return { status: 'password_reset' }
  }
}
