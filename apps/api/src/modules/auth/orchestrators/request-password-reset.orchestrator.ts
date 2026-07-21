import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { RequestPasswordResetResponse } from '@chat/contract'
import { EMAIL_PROVIDER, type EmailProvider } from '../../email/providers/email.provider'
import { hashPassword } from '../../users/lib/password'
import { UsersService } from '../../users/users.service'
import { PasswordResetDbService } from '../password-reset.dbService'
import { buildPasswordResetMessage } from '../lib/password-reset-message'
import { RESET_CODE_TTL_MS, generateResetCode } from '../lib/reset-code'
import type { RequestPasswordResetDto } from '../dto/request-password-reset.dto'

@Injectable()
export class RequestPasswordResetOrchestrator {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetDbService: PasswordResetDbService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    private readonly configService: ConfigService,
  ) {}

  // Always resolves to the same response so a caller cannot tell whether the
  // account exists (no user enumeration). The code is only generated, stored,
  // and emailed when the account is real.
  async execute(dto: RequestPasswordResetDto): Promise<RequestPasswordResetResponse> {
    const user = await this.usersService.findByEmail(dto.email)
    if (user !== undefined) {
      const code = generateResetCode()
      const rounds = this.configService.getOrThrow<number>('BCRYPT_ROUNDS')
      const codeHash = await hashPassword(code, rounds)
      const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MS)
      await this.passwordResetDbService.store(user.id, codeHash, expiresAt)

      const { subject, text } = buildPasswordResetMessage(code)
      await this.emailProvider.send({ to: user.email, subject, text })
    }

    return { status: 'reset_code_sent' }
  }
}
