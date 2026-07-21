import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import type { AuthResponse, User } from '@chat/contract'
import { LoginDto } from './dto/login.dto'
import { SignupDto } from './dto/signup.dto'
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto'
import { SignupOrchestrator } from './orchestrators/signup.orchestrator'
import { LoginOrchestrator } from './orchestrators/login.orchestrator'
import { ConfirmEmailChangeOrchestrator } from './orchestrators/confirm-email-change.orchestrator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupOrchestrator: SignupOrchestrator,
    private readonly loginOrchestrator: LoginOrchestrator,
    private readonly confirmEmailChangeOrchestrator: ConfirmEmailChangeOrchestrator,
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

  // Public: the signed email-change token is the credential, so this works even
  // when the link is opened logged-out or long after the request.
  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  confirmEmailChange(@Body() body: ConfirmEmailChangeDto): Promise<User> {
    return this.confirmEmailChangeOrchestrator.execute(body)
  }
}
