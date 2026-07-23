import type { PaymentEvent } from '../payment/payment.provider'

export const PAYMENT_WEBHOOK_QUEUE = Symbol('PAYMENT_WEBHOOK_QUEUE')

export interface PaymentWebhookQueue {
  enqueue(event: PaymentEvent): Promise<string>
}
