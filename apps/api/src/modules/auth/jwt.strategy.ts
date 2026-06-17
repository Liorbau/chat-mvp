import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import type { User } from '@chat/contract'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from '../users/users.service'

type JwtPayload = {
  sub: string
  email: string
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

  // Passport calls this with the verified payload. We resolve the user by the
  // stable id (sub); a token for a deleted user is rejected. The return value
  // becomes request.user.
  validate(payload: JwtPayload): User {
    const user = this.usersService.findById(payload.sub)
    if (user === undefined) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    return user
  }
}
