import type {
  ConfirmEmailChangeRequest,
  RequestEmailChangeRequest,
  RequestEmailChangeResponse,
  User,
} from '@chat/contract'
import { API_BASE_URL, buildHeaders, request, throwApiError } from './apiClient'

export async function requestEmailChange(
  input: RequestEmailChangeRequest,
): Promise<RequestEmailChangeResponse> {
  return request<RequestEmailChangeResponse>('/me/email', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function confirmEmailChange(input: ConfirmEmailChangeRequest): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/email/confirm`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    // 401 here = invalid/expired token, not a dead session; keep the user logged in.
    await throwApiError(response, false)
  }
  return (await response.json()) as User
}
