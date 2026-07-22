import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import type { User } from '@chat/contract'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { toPublicUser } from '../../users/lib/user.mapper'
import { UsersService } from '../../users/users.service'

type JwtPayload = {
  sub: string
  email: string
  tokenVersion: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    const stored = await this.usersService.findStoredById(payload.sub)
    if (!stored || stored.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    return toPublicUser(stored)
  }
}
