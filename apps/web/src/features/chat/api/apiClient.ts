import type {
  ApiError,
  AssistantSseEvent,
  AuthResponse,
  Conversation,
  ConversationType,
  GetMessagesResponse,
  KnowledgeDocument,
  LoginRequest,
  SendMessageRequest,
  SendMessageResponse,
  SignupRequest,
  User,
} from '@chat/contract'
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

// Maps a non-OK response to an ApiRequestError (clearing auth on 401).
async function throwApiError(response: Response): Promise<never> {
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

function buildHeaders(hasBody: boolean, init?: HeadersInit): Headers {
  const headers = new Headers(init)
  if (hasBody) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token !== null) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = buildHeaders(init.body !== undefined, init.headers)
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })

  if (!response.ok) {
    await throwApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export type CreateConversationInput = {
  type?: ConversationType
  title?: string
  participantIds?: string[]
}

export async function streamAssistant(
  conversationId: string,
  content: string,
  onEvent: (event: AssistantSseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ content }),
    signal,
  })

  if (!response.ok || response.body === null) {
    await throwApiError(response)
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary).trim()
      buffer = buffer.slice(boundary + 2)
      if (frame.startsWith('data:')) {
        const json = frame.slice(5).trim()
        if (json.length > 0) {
          onEvent(JSON.parse(json) as AssistantSseEvent)
        }
      }
      boundary = buffer.indexOf('\n\n')
    }
  }
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

export async function getKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  return request<KnowledgeDocument[]>('/knowledge/documents')
}

export async function deleteKnowledgeDocument(documentId: string): Promise<string> {
  const result = await request<{ id: string }>(`/knowledge/documents/${documentId}`, {
    method: 'DELETE',
  })
  return result.id
}

export async function uploadKnowledgeDocument(file: File): Promise<KnowledgeDocument> {
  const form = new FormData()
  form.append('file', file)
  // No Content-Type header: the browser sets multipart/form-data with a boundary.
  const response = await fetch(`${API_BASE_URL}/knowledge/documents`, {
    method: 'POST',
    headers: buildHeaders(false),
    body: form,
  })
  if (!response.ok) {
    await throwApiError(response)
  }
  return (await response.json()) as KnowledgeDocument
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
