import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import type { AuthResponse } from '@chat/contract'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { SignupDto } from './dto/signup.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() body: SignupDto): Promise<AuthResponse> {
    return this.authService.signup(body)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto): Promise<AuthResponse> {
    return this.authService.login(body)
  }
}
