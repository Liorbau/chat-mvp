import type { UpdateProfileRequest, User } from '@chat/contract'
import { request } from './apiClient'

export async function updateProfile(input: UpdateProfileRequest): Promise<User> {
  return request<User>('/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
