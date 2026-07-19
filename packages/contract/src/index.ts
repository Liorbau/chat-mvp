export type User = {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
}

export type SignupRequest = {
  email: string
  password: string
  firstName: string
  lastName: string
}

export type UpdateProfileRequest = {
  firstName?: string
  lastName?: string
  email?: string
}

export type AvatarResponse = {
  avatarUrl: string | null
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  token: string // signed JWT
  user: User
}

export type ApiError = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ConversationType = 'user' | 'assistant' | 'tutor'

export const ASSISTANT_SENDER_ID = 'assistant'

export type Conversation = {
  id: string
  type: ConversationType
  title?: string
  participantIds: string[]
  lastMessagePreview: string
  updatedAt: string
}

export type DocumentStatus = 'pending' | 'ready' | 'failed'

export type KnowledgeDocument = {
  id: string
  name: string
  mimeType: string
  status: DocumentStatus
  chunkCount: number
  createdAt: string
}

export type Citation = {
  chunkId: string
  documentId: string
  documentName: string
  text: string
  score?: number
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  citations?: Citation[]
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
  | { type: 'tool_call'; tool: string; label: string }
  | { type: 'tool_result'; tool: string }
  | { type: 'done'; messageId: string; citations?: Citation[] }
  | { type: 'error'; code: string; message: string }
