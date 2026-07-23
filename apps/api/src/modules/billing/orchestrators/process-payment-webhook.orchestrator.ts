import { Inject, Injectable, Logger } from '@nestjs/common'
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
  type PaymentWebhookRequest,
} from '../payment/payment.provider'
import { PAYMENT_WEBHOOK_QUEUE, type PaymentWebhookQueue } from '../queue/payment-webhook.queue'

export type WebhookAck = {
  received: boolean
}

@Injectable()
export class ProcessPaymentWebhookOrchestrator {
  private readonly logger = new Logger(ProcessPaymentWebhookOrchestrator.name)

  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly payment: PaymentProvider,
    @Inject(PAYMENT_WEBHOOK_QUEUE) private readonly queue: PaymentWebhookQueue,
  ) {}

  async execute(request: PaymentWebhookRequest): Promise<WebhookAck> {
    const event = this.payment.verifyWebhook(request)
    if (event == null) {
      return { received: true }
    }
    const jobId = await this.queue.enqueue(event)
    this.logger.log(`Enqueued payment webhook '${event.id}' as job ${jobId}.`)
    return { received: true }
  }
}
