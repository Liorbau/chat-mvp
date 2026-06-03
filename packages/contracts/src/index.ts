export type User = {
  id: string
  name: string
  email: string
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

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  user: User
}

export type ApiError = {
  error: string
}
