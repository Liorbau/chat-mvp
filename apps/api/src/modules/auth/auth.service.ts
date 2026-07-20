import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { AuthResponse } from '@chat/contract'
import { HttpAppError } from '../../errors/HttpAppError'
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
    // verifyCredentials returns undefined for both unknown email and wrong
    // password, so we surface one error and never reveal which accounts exist.
    const user = await this.usersService.verifyCredentials(input.email, input.password)
    if (user === undefined) {
      throw HttpAppError.unauthorized('Invalid credentials')
    }

    return { token: this.signToken({ id: user.id, email: user.email }), user }
  }

  private signToken(user: TokenSubject): string {
    return this.jwtService.sign({ sub: user.id, email: user.email })
  }
}
