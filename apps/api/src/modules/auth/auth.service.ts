import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AuthResponse } from '@chat/contract'
import bcrypt from 'bcrypt'
import { AppError } from '../../errors/AppError'
import { toPublicUser } from '../users/users.dbService'
import { UsersService } from '../users/users.service'
import type { LoginDto } from './dto/login.dto'
import type { SignupDto } from './dto/signup.dto'

type TokenSubject = {
  id: string
  email: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signup(input: SignupDto): Promise<AuthResponse> {
    const user = await this.usersService.create(input)
    return { token: this.signToken({ id: user.id, email: user.email }), user }
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    const stored = this.usersService.findByEmail(input.email)
    // Same error for unknown email and wrong password so we never reveal which
    // accounts exist.
    if (stored === undefined) {
      throw AppError.unauthorized('Invalid credentials')
    }

    const passwordMatches = await bcrypt.compare(input.password, stored.passwordHash)
    if (!passwordMatches) {
      throw AppError.unauthorized('Invalid credentials')
    }

    const user = toPublicUser(stored)
    return { token: this.signToken({ id: user.id, email: user.email }), user }
  }

  signToken(user: TokenSubject): string {
    return this.jwtService.sign({ sub: user.id, email: user.email })
  }
}
