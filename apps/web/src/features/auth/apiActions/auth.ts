import type { AuthResponse, LoginRequest, SignupRequest, User } from '@chat/contract'
import { request } from '@/api/apiClient'

export async function getMe(): Promise<User> {
  return request<User>('/me')
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function signup(input: SignupRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
