import type { PlanKey } from '@chat/contract'

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER')

export type CreateCheckoutInput = {
  userId: string
  planKey: PlanKey
  amount: number
  currency: string
  completeUrl: string
  cancelUrl: string
}

export type CreateCheckoutResult = {
  redirectUrl: string
}

export type PaymentWebhookRequest = {
  rawBody: string
  headers: Record<string, string | undefined>
}

export type PaymentEventType = 'payment_completed' | 'payment_failed'

export type PaymentEvent = {
  id: string
  type: PaymentEventType
  userId: string
  planKey: PlanKey
  amount: number
  currency: string
}

export interface PaymentProvider {
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>
  verifyWebhook(request: PaymentWebhookRequest): PaymentEvent | null
}
