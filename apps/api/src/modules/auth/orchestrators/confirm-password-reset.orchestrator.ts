import { Inject, Injectable } from '@nestjs/common'
import type { ConfirmPasswordResetResponse } from '@chat/contract'
import { HttpAppError } from '../../../errors/HttpAppError'
import { UsersService } from '../../users/users.service'
import { RESET_CODE_PROVIDER, type ResetCodeProvider } from '../reset-code/reset-code.provider'
import { PasswordResetService } from '../password-reset.service'
import type { ConfirmPasswordResetDto } from '../dto/confirm-password-reset.dto'

const INVALID_RESET_MESSAGE = 'Invalid or expired reset code.'

@Injectable()
export class ConfirmPasswordResetOrchestrator {
  constructor(
    private readonly usersService: UsersService,
    @Inject(RESET_CODE_PROVIDER) private readonly resetCodeProvider: ResetCodeProvider,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  async execute(dto: ConfirmPasswordResetDto): Promise<ConfirmPasswordResetResponse> {
    const user = await this.usersService.findByEmail(dto.email)
    if (user === undefined) {
      throw HttpAppError.unauthorized(INVALID_RESET_MESSAGE)
    }

    const codeHash = await this.resetCodeProvider.find(user.id)
    if (codeHash === undefined) {
      throw HttpAppError.unauthorized(INVALID_RESET_MESSAGE)
    }

    const codeMatches = await this.passwordResetService.verifyCode(dto.code, codeHash)
    if (!codeMatches) {
      throw HttpAppError.unauthorized(INVALID_RESET_MESSAGE)
    }

    const consumed = await this.resetCodeProvider.consume(user.id)
    if (!consumed) {
      throw HttpAppError.unauthorized(INVALID_RESET_MESSAGE)
    }

    await this.usersService.resetPassword(user.id, dto.newPassword)
    return { status: 'password_reset' }
  }
}
