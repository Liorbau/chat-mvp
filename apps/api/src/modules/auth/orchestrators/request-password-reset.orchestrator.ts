import { Inject, Injectable, Logger } from '@nestjs/common'
import type { RequestPasswordResetResponse } from '@chat/contract'
import { EMAIL_PROVIDER, type EmailProvider } from '../../email/providers/email.provider'
import { UsersService } from '../../users/users.service'
import { RESET_CODE_PROVIDER, type ResetCodeProvider } from '../reset-code/reset-code.provider'
import { PasswordResetService } from '../password-reset.service'
import type { RequestPasswordResetDto } from '../dto/request-password-reset.dto'

@Injectable()
export class RequestPasswordResetOrchestrator {
  private readonly logger = new Logger(RequestPasswordResetOrchestrator.name)

  constructor(
    private readonly usersService: UsersService,
    @Inject(RESET_CODE_PROVIDER) private readonly resetCodeProvider: ResetCodeProvider,
    private readonly passwordResetService: PasswordResetService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
  ) {}

  async execute(dto: RequestPasswordResetDto): Promise<RequestPasswordResetResponse> {
    const user = await this.usersService.findByEmail(dto.email)
    if (user) {
      const code = this.passwordResetService.generateCode()
      const codeHash = await this.passwordResetService.hashCode(code)
      await this.resetCodeProvider.store(user.id, codeHash)

      const { subject, text } = this.passwordResetService.buildMessage(code)
      await this.emailProvider.send({ to: user.email, subject, text })
      this.logger.log(`Password reset code issued for user ${user.id}.`)
    }

    return { status: 'reset_code_sent' }
  }
}
