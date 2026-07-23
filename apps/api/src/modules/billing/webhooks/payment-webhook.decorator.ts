import { createParamDecorator, type ExecutionContext, type RawBodyRequest } from '@nestjs/common'
import type { Request } from 'express'
import type { PaymentWebhookRequest } from '../payment/payment.provider'

function header(req: RawBodyRequest<Request>, name: string): string | undefined {
  const value = req.headers[name]
  return Array.isArray(value) ? value[0] : value
}

export const WebhookRequest = createParamDecorator(
  (_data: unknown, context: ExecutionContext): PaymentWebhookRequest => {
    const req = context.switchToHttp().getRequest<RawBodyRequest<Request>>()
    return {
      rawBody: req.rawBody?.toString('utf8') ?? '',
      headers: {
        signature: header(req, 'signature'),
        salt: header(req, 'salt'),
        timestamp: header(req, 'timestamp'),
      },
    }
  },
)
