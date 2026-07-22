import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { RequestEmailChangeResponse, User } from '@chat/contract'
import { AppError } from '../../../errors/AppError'
import { EMAIL_PROVIDER, type EmailProvider } from '../../email/providers/email.provider'
import { UsersService } from '../../users/users.service'
import { EmailChangeTokenService } from '../email-change-token.service'
import { buildConfirmUrl, buildEmailChangeMessage } from '../lib/email-change-message'
import type { RequestEmailChangeDto } from '../dto/request-email-change.dto'

@Injectable()
export class RequestEmailChangeOrchestrator {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: EmailChangeTokenService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(user: User, dto: RequestEmailChangeDto): Promise<RequestEmailChangeResponse> {
    const newEmail = dto.newEmail
    if (newEmail === user.email) {
      throw AppError.badRequest('That is already your email address. Enter a different one.')
    }
    if (await this.usersService.isEmailTaken(newEmail, user.id)) {
      throw AppError.conflict(
        'EMAIL_ALREADY_EXISTS',
        'That email is already in use by another account.',
      )
    }

    const token = await this.tokenService.sign({ userId: user.id, newEmail })
    const confirmUrl = buildConfirmUrl(this.configService.getOrThrow<string>('WEB_APP_URL'), token)
    const { subject, text } = buildEmailChangeMessage(confirmUrl)
    await this.emailProvider.send({ to: newEmail, subject, text })

    return { status: 'confirmation_sent' }
  }
}
