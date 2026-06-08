// Single source of truth for the chat domain types shared by the frontend
// (apps/web) and the backend (apps/api). The frontend is wired to the real
// Week 3 backend, so the auth login shape and the error envelope are unified
// here too.

export type User = {
  id: string
  name: string
  email: string
}

// Week 3 identity flow: log in by choosing a userId; the server issues a token
// and derives the sender from it on every subsequent request.
export type LoginRequest = {
  userId: string
}

export type LoginResponse = {
  token: string
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

export type Conversation = {
  id: string
  title: string
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
