import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { EmailProviderName } from '../../config/env.validation'
import { EMAIL_PROVIDER, type EmailProvider } from './providers/email.provider'
import { LogEmailProvider } from './providers/log.email'
import { SesEmailProvider } from './providers/ses.email'

const EMAIL_PROVIDER_FACTORIES: Record<
  EmailProviderName,
  (config: ConfigService) => EmailProvider
> = {
  log: () => new LogEmailProvider(),
  ses: (config) => new SesEmailProvider(config),
}

@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): EmailProvider => {
        const name = config.getOrThrow<EmailProviderName>('EMAIL_PROVIDER')
        return EMAIL_PROVIDER_FACTORIES[name](config)
      },
    },
  ],
  exports: [EMAIL_PROVIDER],
})
export class EmailModule {}
