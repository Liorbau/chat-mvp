import type { PlanKey } from '@chat/contract'
import { AppError } from '../../../../errors/AppError'
import type { PaymentEvent, PaymentEventType } from '../payment.provider'
import { requireString } from './webhook-fields'

const COMPLETED_TYPES = new Set(['PAYMENT_COMPLETED', 'PAYMENT_SUCCEEDED'])
const FAILED_TYPES = new Set(['PAYMENT_FAILED', 'PAYMENT_CANCELED', 'PAYMENT_DECLINED'])

type RapydWebhookBody = {
  id?: unknown
  type?: unknown
  data?: {
    amount?: unknown
    currency?: unknown
    currency_code?: unknown
    merchant_reference_id?: unknown
    metadata?: { userId?: unknown; planKey?: unknown }
  }
}

export function extractRedirectUrl(response: unknown): string {
  const url = (response as { data?: { redirect_url?: unknown } }).data?.redirect_url
  if (typeof url !== 'string' || url.length === 0) {
    throw AppError.badRequest('Payment provider did not return a redirect URL')
  }
  return url
}

export function toRapydEvent(rawBody: string): PaymentEvent | null {
  const body = JSON.parse(rawBody) as RapydWebhookBody
  const type = normalizeType(body.type)
  if (type == null) {
    return null
  }
  const data = body.data ?? {}
  const fromReference = parseMerchantReference(data.merchant_reference_id)
  return {
    id: requireString(body.id, 'id'),
    type,
    userId: requireString(data.metadata?.userId ?? fromReference?.userId, 'userId'),
    planKey: requireString(data.metadata?.planKey ?? fromReference?.planKey, 'planKey') as PlanKey,
    amount: majorUnitsToMinor(data.amount, 'amount'),
    currency: requireString(data.currency_code ?? data.currency, 'currency').toUpperCase(),
  }
}

export function buildMerchantReference(userId: string, planKey: PlanKey): string {
  return `${userId}:${planKey}`
}

function parseMerchantReference(value: unknown): { userId: string; planKey: string } | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined
  }
  const separator = value.lastIndexOf(':')
  if (separator <= 0 || separator === value.length - 1) {
    return undefined
  }
  return {
    userId: value.slice(0, separator),
    planKey: value.slice(separator + 1),
  }
}

function majorUnitsToMinor(value: unknown, field: string): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return Math.round(value * 100)
  }
  if (typeof value === 'string' && value.length > 0) {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) {
      return Math.round(parsed * 100)
    }
  }
  throw AppError.badRequest(`Webhook field '${field}' must be a number`)
}

function normalizeType(type: unknown): PaymentEventType | null {
  if (typeof type !== 'string') {
    return null
  }
  if (COMPLETED_TYPES.has(type)) {
    return 'payment_completed'
  }
  if (FAILED_TYPES.has(type)) {
    return 'payment_failed'
  }
  return null
}
