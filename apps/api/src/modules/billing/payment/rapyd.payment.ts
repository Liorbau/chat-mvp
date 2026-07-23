import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { ConfigService } from '@nestjs/config'
import { AppError } from '../../../errors/AppError'
import { buildMerchantReference, extractRedirectUrl, toRapydEvent } from './lib/rapyd.mapper'
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentEvent,
  PaymentProvider,
  PaymentWebhookRequest,
} from './payment.provider'

export class RapydPaymentProvider implements PaymentProvider {
  private readonly baseUrl: string
  private readonly accessKey: string
  private readonly secretKey: string
  private readonly checkoutCountry: string
  private readonly webhookUrl: string

  constructor(config: ConfigService) {
    this.baseUrl = config.getOrThrow<string>('RAPYD_BASE_URL')
    this.accessKey = config.getOrThrow<string>('RAPYD_ACCESS_KEY')
    this.secretKey = config.getOrThrow<string>('RAPYD_SECRET_KEY')
    this.checkoutCountry = config.getOrThrow<string>('RAPYD_CHECKOUT_COUNTRY')
    this.webhookUrl = config.getOrThrow<string>('RAPYD_WEBHOOK_URL')
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const path = '/v1/checkout'
    const body = {
      amount: input.amount / 100,
      country: this.checkoutCountry,
      currency: input.currency,
      payment_method_type_categories: ['card'],
      complete_checkout_url: input.completeUrl,
      cancel_checkout_url: input.cancelUrl,
      complete_payment_url: input.completeUrl,
      error_payment_url: input.cancelUrl,
      merchant_reference_id: buildMerchantReference(input.userId, input.planKey),
      metadata: { userId: input.userId, planKey: input.planKey },
    }
    const response = await this.signedRequest(path, body)
    return { redirectUrl: extractRedirectUrl(response) }
  }

  verifyWebhook(request: PaymentWebhookRequest): PaymentEvent | null {
    const { signature, salt, timestamp } = request.headers
    if (!signature || !salt || !timestamp) {
      throw AppError.unauthorized('Missing webhook signature headers')
    }
    const expected = this.sign(
      this.webhookUrl + salt + timestamp + this.accessKey + this.secretKey + request.rawBody,
    )
    if (!this.safeEqual(signature, expected)) {
      throw AppError.unauthorized('Invalid webhook signature')
    }
    return toRapydEvent(request.rawBody)
  }

  private async signedRequest(path: string, body: unknown): Promise<unknown> {
    const salt = randomBytes(8).toString('hex')
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const bodyString = JSON.stringify(body)
    const signature = this.sign(
      'post' + path + salt + timestamp + this.accessKey + this.secretKey + bodyString,
    )
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_key: this.accessKey,
        salt,
        timestamp,
        signature,
      },
      body: bodyString,
    })
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 400)
      throw AppError.badRequest(
        detail.length > 0
          ? `Payment provider request failed (${response.status}): ${detail}`
          : `Payment provider request failed (${response.status})`,
      )
    }
    return response.json()
  }

  private sign(message: string): string {
    const hex = createHmac('sha256', this.secretKey).update(message).digest('hex')
    return Buffer.from(hex).toString('base64')
  }

  private safeEqual(actual: string, expected: string): boolean {
    const a = Buffer.from(actual)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
  }
}
