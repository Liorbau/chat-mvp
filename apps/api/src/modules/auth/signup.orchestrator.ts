import { Injectable } from '@nestjs/common'
import type { AuthResponse } from '@chat/contract'
import { AuthService } from './auth.service'
import type { SignupDto } from './dto/signup.dto'

@Injectable()
export class SignupOrchestrator {
  constructor(private readonly authService: AuthService) {}

  execute(dto: SignupDto): Promise<AuthResponse> {
    return this.authService.signup(dto)
  }
}
