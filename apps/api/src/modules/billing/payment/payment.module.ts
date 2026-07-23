import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { PaymentProviderName } from '../../../config/env.validation'
import { LocalPaymentProvider } from './local.payment'
import { PAYMENT_PROVIDER, type PaymentProvider } from './payment.provider'
import { RapydPaymentProvider } from './rapyd.payment'

const PAYMENT_PROVIDER_FACTORIES: Record<
  PaymentProviderName,
  (config: ConfigService) => PaymentProvider
> = {
  local: (config) => new LocalPaymentProvider(config.getOrThrow<string>('JWT_SECRET')),
  rapyd: (config) => new RapydPaymentProvider(config),
}

@Module({
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): PaymentProvider => {
        const name = config.getOrThrow<PaymentProviderName>('PAYMENT_PROVIDER')
        return PAYMENT_PROVIDER_FACTORIES[name](config)
      },
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentModule {}
