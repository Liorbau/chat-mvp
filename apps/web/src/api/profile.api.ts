import type { AvatarResponse, UpdateProfileRequest, User } from '@chat/contract'
import { API_BASE_URL, buildHeaders, request, throwApiError } from './apiClient'

export async function updateProfile(input: UpdateProfileRequest): Promise<User> {
  return request<User>('/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function uploadAvatar(file: File): Promise<AvatarResponse> {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(`${API_BASE_URL}/me/avatar`, {
    method: 'POST',
    headers: buildHeaders(false),
    body: form,
  })
  if (!response.ok) {
    await throwApiError(response)
  }
  return (await response.json()) as AvatarResponse
}

export async function removeAvatar(): Promise<AvatarResponse> {
  return request<AvatarResponse>('/me/avatar', { method: 'DELETE' })
}
