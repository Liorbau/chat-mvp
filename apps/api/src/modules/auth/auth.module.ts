import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule, type JwtModuleOptions, type JwtSignOptions } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { LoginOrchestrator } from './orchestrators/login.orchestrator'
import { MeController } from './me.controller'
import { SignupOrchestrator } from './orchestrators/signup.orchestrator'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') as NonNullable<
            JwtSignOptions['expiresIn']
          >,
        },
      }),
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [AuthService, JwtStrategy, SignupOrchestrator, LoginOrchestrator],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
