import { Injectable } from '@nestjs/common'
import type { AuthResponse } from '@chat/contract'
import { UsersService } from '../../users/users.service'
import { AuthService } from '../auth.service'
import type { SignupDto } from '../dto/signup.dto'

@Injectable()
export class SignupOrchestrator {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async execute(dto: SignupDto): Promise<AuthResponse> {
    const user = await this.usersService.create(dto)
    const tokenVersion = await this.usersService.tokenVersionOf(user.id)
    return { token: this.authService.signToken(user, tokenVersion), user }
  }
}
