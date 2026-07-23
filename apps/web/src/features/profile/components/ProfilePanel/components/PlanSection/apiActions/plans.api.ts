import type {
  CreatePaymentSessionRequest,
  ListPlansResponse,
  PaymentSessionResponse,
} from '@chat/contract'
import { request } from '@/api/apiClient'

export async function getPlans(): Promise<ListPlansResponse> {
  return request<ListPlansResponse>('/users/plans')
}

export async function createPaymentSession(
  input: CreatePaymentSessionRequest,
): Promise<PaymentSessionResponse> {
  return request<PaymentSessionResponse>('/users/plans/payment-session', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
