import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import type { AuthResponse } from '@chat/contract'
import { LoginDto } from './dto/login.dto'
import { SignupDto } from './dto/signup.dto'
import { SignupOrchestrator } from './signup.orchestrator'
import { LoginOrchestrator } from './login.orchestrator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupOrchestrator: SignupOrchestrator,
    private readonly loginOrchestrator: LoginOrchestrator,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() body: SignupDto): Promise<AuthResponse> {
    return this.signupOrchestrator.execute(body)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto): Promise<AuthResponse> {
    return this.loginOrchestrator.execute(body)
  }
}
