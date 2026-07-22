import type {
  ConfirmPasswordResetRequest,
  ConfirmPasswordResetResponse,
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
} from '@chat/contract'
import { API_BASE_URL, buildHeaders, request, throwApiError } from '@/api/apiClient'

export async function requestPasswordReset(
  input: RequestPasswordResetRequest,
): Promise<RequestPasswordResetResponse> {
  return request<RequestPasswordResetResponse>('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function confirmPasswordReset(
  input: ConfirmPasswordResetRequest,
): Promise<ConfirmPasswordResetResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    // 401 here = wrong/expired code, not a dead session; don't clear stored auth.
    await throwApiError(response, false)
  }
  return (await response.json()) as ConfirmPasswordResetResponse
}
