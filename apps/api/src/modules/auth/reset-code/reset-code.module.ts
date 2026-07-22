import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ResetCodeDriver } from '../../../config/env.validation'
import { MemoryResetCodeProvider } from './memory.reset-code'
import { RedisResetCodeProvider } from './redis.reset-code'
import { RESET_CODE_PROVIDER, type ResetCodeProvider } from './reset-code.provider'

const RESET_CODE_PROVIDER_FACTORIES: Record<
  ResetCodeDriver,
  (config: ConfigService) => ResetCodeProvider
> = {
  redis: (config) => new RedisResetCodeProvider(config),
  memory: () => new MemoryResetCodeProvider(),
}

@Module({
  providers: [
    {
      provide: RESET_CODE_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): ResetCodeProvider => {
        const driver = config.getOrThrow<ResetCodeDriver>('RESET_CODE_DRIVER')
        return RESET_CODE_PROVIDER_FACTORIES[driver](config)
      },
    },
  ],
  exports: [RESET_CODE_PROVIDER],
})
export class ResetCodeModule {}
