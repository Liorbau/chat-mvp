import { randomUUID } from 'node:crypto'
import { Logger } from '@nestjs/common'
import type { PaymentEvent } from '../payment/payment.provider'
import type { PaymentWebhookQueue } from './payment-webhook.queue'

export class MemoryPaymentWebhookQueue implements PaymentWebhookQueue {
  private readonly logger = new Logger(MemoryPaymentWebhookQueue.name)

  enqueue(event: PaymentEvent): Promise<string> {
    const jobId = randomUUID()
    this.logger.warn(
      `Dropping payment webhook '${event.id}' (job ${jobId}): memory queue has no worker.`,
    )
    return Promise.resolve(jobId)
  }
}
