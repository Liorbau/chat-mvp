export type User = {
  id: string
  name: string
  email: string
}

export type SignupRequest = {
  email: string
  password: string
  name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  token: string // signed JWT
  user: User
}

// Structured error envelope returned by the backend on every failure.
export type ApiError = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// 'user' = human-to-human conversation; 'assistant' = human-to-AI.
export type ConversationType = 'user' | 'assistant'

export const ASSISTANT_SENDER_ID = 'assistant'

export type Conversation = {
  id: string
  type: ConversationType
  title?: string
  participantIds: string[]
  lastMessagePreview: string
  updatedAt: string
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export type GetMessagesResponse = {
  messages: Message[]
  nextCursor: string | null
}

export type SendMessageRequest = {
  conversationId: string
  content: string
}

export type SendMessageResponse = {
  message: Message
}

export type AssistantSseEvent =
  | { type: 'user_message'; message: Message }
  | { type: 'token'; value: string }
  | { type: 'status'; state: 'thinking' | 'tool_call' }
  | { type: 'done'; messageId: string }
  | { type: 'error'; code: string; message: string }
