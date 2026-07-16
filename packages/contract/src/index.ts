export type User = {
  id: string
  // `name` is the display full name, derived server-side from firstName + lastName.
  name: string
  firstName: string
  lastName: string
  email: string
}

export type SignupRequest = {
  email: string
  password: string
  firstName: string
  lastName: string
}

// Partial profile update: the name form sends firstName+lastName, the email form
// sends email; either may be omitted independently.
export type UpdateProfileRequest = {
  firstName?: string
  lastName?: string
  email?: string
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

// 'user' = human-to-human; 'assistant' = human-to-AI (Week 6); 'tutor' = human-to-AI
// grounded in the user's own uploaded knowledge base with citations (Week 7).
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

// Ingestion is synchronous, so 'pending' is brief; a document ends 'ready' or
// 'failed'.
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
  // Present only on tutor answers: the sources the answer was grounded in.
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
  // Agent tool progress: a tool started (with a display label) / finished.
  | { type: 'tool_call'; tool: string; label: string }
  | { type: 'tool_result'; tool: string }
  | { type: 'done'; messageId: string; citations?: Citation[] }
  | { type: 'error'; code: string; message: string }
