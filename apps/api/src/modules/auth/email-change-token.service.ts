import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, type JwtSignOptions } from '@nestjs/jwt'
import { AppError } from '../../errors/AppError'

export type EmailChangeTokenPayload = {
  userId: string
  newEmail: string
}

@Injectable()
export class EmailChangeTokenService {
  private readonly secret: string
  private readonly expiresIn: NonNullable<JwtSignOptions['expiresIn']>

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.secret = configService.getOrThrow<string>('EMAIL_CHANGE_TOKEN_SECRET')
    this.expiresIn = configService.getOrThrow<string>('EMAIL_CHANGE_TOKEN_TTL') as NonNullable<
      JwtSignOptions['expiresIn']
    >
  }

  sign(payload: EmailChangeTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, { secret: this.secret, expiresIn: this.expiresIn })
  }

  async verify(token: string): Promise<EmailChangeTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<EmailChangeTokenPayload>(token, {
        secret: this.secret,
      })
      return { userId: payload.userId, newEmail: payload.newEmail }
    } catch {
      throw AppError.unauthorized('Invalid or expired email-change token')
    }
  }
}
