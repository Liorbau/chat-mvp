import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { QueueDriver } from '../../../config/env.validation'
import { BullmqPaymentWebhookQueue } from './bullmq.payment-webhook.queue'
import { MemoryPaymentWebhookQueue } from './memory.payment-webhook.queue'
import { PAYMENT_WEBHOOK_QUEUE, type PaymentWebhookQueue } from './payment-webhook.queue'

const PAYMENT_WEBHOOK_QUEUE_FACTORIES: Record<
  QueueDriver,
  (config: ConfigService) => PaymentWebhookQueue
> = {
  bullmq: (config) => new BullmqPaymentWebhookQueue(config),
  memory: () => new MemoryPaymentWebhookQueue(),
}

@Module({
  providers: [
    {
      provide: PAYMENT_WEBHOOK_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService): PaymentWebhookQueue => {
        const driver = config.getOrThrow<QueueDriver>('QUEUE_DRIVER')
        return PAYMENT_WEBHOOK_QUEUE_FACTORIES[driver](config)
      },
    },
  ],
  exports: [PAYMENT_WEBHOOK_QUEUE],
})
export class QueueModule {}
