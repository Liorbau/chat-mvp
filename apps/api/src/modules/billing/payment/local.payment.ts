import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import type { PlanKey } from '@chat/contract'
import { AppError } from '../../../errors/AppError'
import { requireNumber, requireString } from './lib/webhook-fields'
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentEvent,
  PaymentEventType,
  PaymentProvider,
  PaymentWebhookRequest,
} from './payment.provider'

const EVENT_TYPES: PaymentEventType[] = ['payment_completed', 'payment_failed']

export class LocalPaymentProvider implements PaymentProvider {
  private readonly webhookSecret: Buffer

  constructor(jwtSecret: string) {
    this.webhookSecret = createHash('sha256').update(jwtSecret).digest()
  }

  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const url = new URL(input.completeUrl)
    url.searchParams.set('session', `local_${randomUUID()}`)
    url.searchParams.set('plan', input.planKey)
    return Promise.resolve({ redirectUrl: url.toString() })
  }

  verifyWebhook(request: PaymentWebhookRequest): PaymentEvent | null {
    this.assertSignature(request.headers.signature)
    const event = this.parse(request.rawBody)
    return EVENT_TYPES.includes(event.type) ? event : null
  }

  private assertSignature(signature: string | undefined): void {
    if (!signature) {
      throw AppError.unauthorized('Missing webhook signature header')
    }
    const provided = Buffer.from(signature, 'hex')
    if (
      provided.length !== this.webhookSecret.length ||
      !timingSafeEqual(provided, this.webhookSecret)
    ) {
      throw AppError.unauthorized('Invalid webhook signature')
    }
  }

  private parse(rawBody: string): PaymentEvent {
    let data: unknown
    try {
      data = JSON.parse(rawBody)
    } catch {
      throw AppError.badRequest('Invalid webhook body')
    }
    if (typeof data !== 'object' || !data) {
      throw AppError.badRequest('Invalid webhook body')
    }
    const raw = data as Record<string, unknown>
    return {
      id: requireString(raw.id, 'id'),
      type: requireString(raw.type, 'type') as PaymentEventType,
      userId: requireString(raw.userId, 'userId'),
      planKey: requireString(raw.planKey, 'planKey') as PlanKey,
      amount: requireNumber(raw.amount, 'amount'),
      currency: requireString(raw.currency, 'currency'),
    }
  }
}

export function localWebhookSignature(jwtSecret: string): string {
  return createHash('sha256').update(jwtSecret).digest('hex')
}
