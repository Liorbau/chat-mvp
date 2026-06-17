import type {
  ApiError,
  AuthResponse,
  Conversation,
  GetMessagesResponse,
  LoginRequest,
  SendMessageRequest,
  SendMessageResponse,
  SignupRequest,
  User,
} from './chatApi.types'
import { clearStoredAuth, getToken } from '../../auth/authStorage'

const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000'

export class ApiRequestError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown

  constructor(status: number, code: string, message: string, details: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiError).error === 'object'
  )
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token !== null) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth()
    }
    const body: unknown = await response.json().catch(() => null)
    if (isApiError(body)) {
      throw new ApiRequestError(
        response.status,
        body.error.code,
        body.error.message,
        body.error.details,
      )
    }
    throw new ApiRequestError(
      response.status,
      'UNKNOWN',
      `Request failed (${response.status})`,
      undefined,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export type CreateConversationInput = {
  title?: string
  participantIds: string[]
}

export async function getConversations(): Promise<Conversation[]> {
  return request<Conversation[]>('/conversations')
}

export async function createConversation(input: CreateConversationInput): Promise<Conversation> {
  return request<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getMessages(
  conversationId: string,
  cursor?: string,
): Promise<GetMessagesResponse> {
  const query = cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`
  return request<GetMessagesResponse>(`/conversations/${conversationId}/messages${query}`)
}

export async function sendMessage(request_: SendMessageRequest): Promise<SendMessageResponse> {
  return request<SendMessageResponse>(`/conversations/${request_.conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: request_.content }),
  })
}

export async function getUsers(): Promise<User[]> {
  return request<User[]>('/users')
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
