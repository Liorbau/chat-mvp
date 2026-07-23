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
