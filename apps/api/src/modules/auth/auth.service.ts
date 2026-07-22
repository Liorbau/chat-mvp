import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AuthResponse, User } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { UsersService } from '../users/users.service'
import type { LoginDto } from './dto/login.dto'
import type { SignupDto } from './dto/signup.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signup(input: SignupDto): Promise<AuthResponse> {
    const user = await this.usersService.create(input)
    return { token: await this.signToken(user), user }
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    // verifyCredentials returns undefined for both unknown email and wrong
    // password, so we surface one error and never reveal which accounts exist.
    const user = await this.usersService.verifyCredentials(input.email, input.password)
    if (!user) {
      throw AppError.unauthorized('Invalid credentials')
    }

    return { token: await this.signToken(user), user }
  }

  private async signToken(user: User): Promise<string> {
    const stored = await this.usersService.findStoredById(user.id)
    if (!stored) {
      throw AppError.notFound('User not found')
    }
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tokenVersion: stored.tokenVersion,
    })
  }
}
