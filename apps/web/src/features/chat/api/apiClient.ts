import type {
  ApiError,
  Conversation,
  GetMessagesResponse,
  LoginRequest,
  LoginResponse,
  SendMessageRequest,
  SendMessageResponse,
} from './chatApi.types'

const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000'

// The apiClient owns the auth boundary: it holds the token issued at login and
// attaches it to every request.
let authToken: string | null = null

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
  if (authToken !== null) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    const message = isApiError(body) ? body.error.message : `Request failed (${response.status})`
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function getConversations(): Promise<Conversation[]> {
  return request<Conversation[]>('/conversations')
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

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const result = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  authToken = result.token
  return result
}

export async function logout(): Promise<void> {
  try {
    await request<void>('/auth/logout', { method: 'POST' })
  } finally {
    authToken = null
  }
}
