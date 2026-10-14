import { Injectable } from '@nestjs/common'
import type { AuthResponse } from '@chat/contract'
import { AppError } from '../../../errors/AppError'
import { UsersService } from '../../users/users.service'
import { AuthService } from '../auth.service'
import type { LoginDto } from '../dto/login.dto'

@Injectable()
export class LoginOrchestrator {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    // One error for unknown email and wrong password, so accounts can't be enumerated.
    const user = await this.usersService.verifyCredentials(dto.email, dto.password)
    if (!user) {
      throw AppError.unauthorized('Invalid credentials')
    }
    const tokenVersion = await this.usersService.tokenVersionOf(user.id)
    return { token: this.authService.signToken(user, tokenVersion), user }
  }
}
