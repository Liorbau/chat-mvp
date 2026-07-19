import { Injectable } from '@nestjs/common'
import type { AuthResponse } from '@chat/contract'
import { AuthService } from '../auth.service'
import type { LoginDto } from '../dto/login.dto'

@Injectable()
export class LoginOrchestrator {
  constructor(private readonly authService: AuthService) {}

  execute(dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto)
  }
}
