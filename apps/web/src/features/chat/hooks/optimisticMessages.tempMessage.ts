import type { Message } from '../api/chatApi.types'
import { getSessionUserId } from '../auth/authSession'

export function createTemporaryMessage(conversationId: string, content: string): Message {
  const currentUserId = getSessionUserId() ?? 'user-1'

  return {
    id: `temp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    conversationId,
    senderId: currentUserId,
    content,
    createdAt: new Date().toISOString(),
  }
}
