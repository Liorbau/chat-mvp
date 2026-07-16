import type { User } from '@chat/contract'
import { request } from './apiClient'

export async function getUsers(): Promise<User[]> {
  return request<User[]>('/users')
}
