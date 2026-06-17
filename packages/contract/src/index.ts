// Single source of truth for the chat domain types shared by the frontend
// (apps/web) and the backend (apps/api). The frontend is wired to the real
// Week 3 backend, so the auth login shape and the error envelope are unified
// here too.

export type User = {
  id: string
  name: string
  email: string
}

// Week 4 identity flow: email + password auth. The server verifies credentials,
// hashes passwords with bcrypt, and issues a signed JWT. The password is never
// part of `User` or any response body.
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

export type Conversation = {
  id: string
  // Optional: direct chats derive their display name from participants, so they
  // carry no stored title. Named/group conversations may set one.
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
