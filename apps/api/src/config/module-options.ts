import { ValidationPipe } from '@nestjs/common'
import { ConfigService, type ConfigModuleOptions } from '@nestjs/config'
import type { MongooseModuleAsyncOptions } from '@nestjs/mongoose'
import { validateEnv } from './env.validation'

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  validate: validateEnv,
  ignoreEnvFile: process.env.VITEST !== undefined,
}

export const mongooseAsyncOptions: MongooseModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): { uri: string } => ({
    uri: configService.getOrThrow<string>('MONGO_URI'),
  }),
}

export const globalValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
})
