import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import type {
  AuthResponse,
  ConfirmPasswordResetResponse,
  RequestPasswordResetResponse,
  User,
} from '@chat/contract'
import { LoginDto } from './dto/login.dto'
import { SignupDto } from './dto/signup.dto'
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto'
import { RequestPasswordResetDto } from './dto/request-password-reset.dto'
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto'
import { SignupOrchestrator } from './orchestrators/signup.orchestrator'
import { LoginOrchestrator } from './orchestrators/login.orchestrator'
import { ConfirmEmailChangeOrchestrator } from './orchestrators/confirm-email-change.orchestrator'
import { RequestPasswordResetOrchestrator } from './orchestrators/request-password-reset.orchestrator'
import { ConfirmPasswordResetOrchestrator } from './orchestrators/confirm-password-reset.orchestrator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupOrchestrator: SignupOrchestrator,
    private readonly loginOrchestrator: LoginOrchestrator,
    private readonly confirmEmailChangeOrchestrator: ConfirmEmailChangeOrchestrator,
    private readonly requestPasswordResetOrchestrator: RequestPasswordResetOrchestrator,
    private readonly confirmPasswordResetOrchestrator: ConfirmPasswordResetOrchestrator,
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

  // Public "forgot password": the response is identical whether or not the
  // account exists, so it can't be used to probe which emails are registered.
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  requestPasswordReset(
    @Body() body: RequestPasswordResetDto,
  ): Promise<RequestPasswordResetResponse> {
    return this.requestPasswordResetOrchestrator.execute(body)
  }

  // Public: the emailed code is the credential. Verifies it, sets the new
  // password, and bumps tokenVersion so every existing session is kicked.
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  confirmPasswordReset(
    @Body() body: ConfirmPasswordResetDto,
  ): Promise<ConfirmPasswordResetResponse> {
    return this.confirmPasswordResetOrchestrator.execute(body)
  }
}
