import type { OnModuleDestroy } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import Redis from 'ioredis'
import type { PaymentEvent } from '../payment/payment.provider'
import type { PaymentWebhookQueue } from './payment-webhook.queue'
import {
  PAYMENT_WEBHOOK_JOB,
  PAYMENT_WEBHOOK_JOB_OPTIONS,
  PAYMENT_WEBHOOK_QUEUE_NAME,
} from './queue.constants'

export class BullmqPaymentWebhookQueue implements PaymentWebhookQueue, OnModuleDestroy {
  private readonly connection: Redis
  private readonly queue: Queue

  constructor(config: ConfigService) {
    this.connection = new Redis(config.getOrThrow<string>('REDIS_URL'), {
      maxRetriesPerRequest: null,
    })
    this.queue = new Queue(PAYMENT_WEBHOOK_QUEUE_NAME, { connection: this.connection })
  }

  async enqueue(event: PaymentEvent): Promise<string> {
    const job = await this.queue.add(PAYMENT_WEBHOOK_JOB, event, PAYMENT_WEBHOOK_JOB_OPTIONS)
    if (job.id == null) {
      throw new Error('BullMQ did not assign a job id')
    }
    return job.id
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close()
    await this.connection.quit()
  }
}
