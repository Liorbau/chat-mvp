import type { Conversation } from '@chat/contract'

const conversations = new Map<string, Conversation>()

export function getConversation(conversationId: string): Conversation | undefined {
  return conversations.get(conversationId)
}

export function listConversations(): Conversation[] {
  return [...conversations.values()]
}

export function setConversation(conversation: Conversation): void {
  conversations.set(conversation.id, conversation)
}

export function clearConversations(): void {
  conversations.clear()
}
