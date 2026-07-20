import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module'
import { EmailModule } from '../email/email.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { EmailChangeTokenService } from './email-change-token.service'
import { jwtAsyncOptions } from './jwt/jwt.options'
import { JwtStrategy } from './jwt/jwt.strategy'
import { LoginOrchestrator } from './orchestrators/login.orchestrator'
import { MeController } from './me.controller'
import { SignupOrchestrator } from './orchestrators/signup.orchestrator'
import { RequestEmailChangeOrchestrator } from './orchestrators/request-email-change.orchestrator'
import { ConfirmEmailChangeOrchestrator } from './orchestrators/confirm-email-change.orchestrator'

@Module({
  imports: [UsersModule, EmailModule, PassportModule, JwtModule.registerAsync(jwtAsyncOptions)],
  controllers: [AuthController, MeController],
  providers: [
    AuthService,
    JwtStrategy,
    EmailChangeTokenService,
    SignupOrchestrator,
    LoginOrchestrator,
    RequestEmailChangeOrchestrator,
    ConfirmEmailChangeOrchestrator,
  ],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
