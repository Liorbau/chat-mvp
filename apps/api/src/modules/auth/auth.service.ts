import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { User } from '@chat/contract'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  signToken(user: User, tokenVersion: number): string {
    return this.jwtService.sign({ sub: user.id, email: user.email, tokenVersion })
  }
}
