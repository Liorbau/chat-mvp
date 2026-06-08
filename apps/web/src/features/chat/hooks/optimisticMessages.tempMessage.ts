import type { Message } from '../api/chatApi.types'

export function createTemporaryMessage(
  conversationId: string,
  currentUserId: string,
  content: string,
): Message {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    conversationId,
    senderId: currentUserId,
    content,
    createdAt: new Date().toISOString(),
  }
}
