import { Controller, HttpCode, Post } from '@nestjs/common'
import type { PaymentWebhookRequest } from '../payment/payment.provider'
import {
  ProcessPaymentWebhookOrchestrator,
  type WebhookAck,
} from '../orchestrators/process-payment-webhook.orchestrator'
import { WebhookRequest } from './payment-webhook.decorator'

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly processPaymentWebhook: ProcessPaymentWebhookOrchestrator) {}

  @Post('payments')
  @HttpCode(200)
  async handlePayment(@WebhookRequest() request: PaymentWebhookRequest): Promise<WebhookAck> {
    return this.processPaymentWebhook.execute(request)
  }
}
