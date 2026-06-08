import { randomUUID } from 'node:crypto'
import type { Conversation } from '@chat/contract'
import { getConversation, listConversations, setConversation } from '../db/conversations.store'

export type ConversationDraft = Omit<Conversation, 'id'>

export function findById(conversationId: string): Conversation | undefined {
  return getConversation(conversationId)
}

export function listByParticipant(userId: string): Conversation[] {
  return listConversations().filter((conversation) => {
    return conversation.participantIds.includes(userId)
  })
}

export function findDirectByParticipants(participantIds: string[]): Conversation | undefined {
  if (participantIds.length !== 2) {
    return undefined
  }

  const target = new Set(participantIds)
  return listConversations().find((conversation) => {
    if (conversation.participantIds.length !== 2) {
      return false
    }

    return conversation.participantIds.every((participantId) => {
      return target.has(participantId)
    })
  })
}

export function create(draft: ConversationDraft): Conversation {
  const conversation: Conversation = { id: randomUUID(), ...draft }
  setConversation(conversation)
  return conversation
}

export function update(
  conversationId: string,
  patch: Partial<ConversationDraft>,
): Conversation | undefined {
  const existing = getConversation(conversationId)
  if (existing === undefined) {
    return undefined
  }

  const updated: Conversation = { ...existing, ...patch }
  setConversation(updated)
  return updated
}
