import { ConfigService } from '@nestjs/config'
import type { JwtModuleAsyncOptions, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt'

export const jwtAsyncOptions: JwtModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): JwtModuleOptions => ({
    secret: configService.getOrThrow<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') as NonNullable<
        JwtSignOptions['expiresIn']
      >,
    },
  }),
}
