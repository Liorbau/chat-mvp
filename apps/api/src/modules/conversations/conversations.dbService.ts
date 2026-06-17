import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import type { Conversation } from '@chat/contract'
import { getConversation, listConversations, setConversation } from '../../db/conversations.store'

export type ConversationDraft = Omit<Conversation, 'id'>

@Injectable()
export class ConversationsDbService {
  findById(conversationId: string): Conversation | undefined {
    return getConversation(conversationId)
  }

  listByParticipant(userId: string): Conversation[] {
    return listConversations().filter((conversation) => {
      return conversation.participantIds.includes(userId)
    })
  }

  findDirectByParticipants(participantIds: string[]): Conversation | undefined {
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

  create(draft: ConversationDraft): Conversation {
    const conversation: Conversation = { id: randomUUID(), ...draft }
    setConversation(conversation)
    return conversation
  }

  update(conversationId: string, patch: Partial<ConversationDraft>): Conversation | undefined {
    const existing = getConversation(conversationId)
    if (existing === undefined) {
      return undefined
    }

    const updated: Conversation = { ...existing, ...patch }
    setConversation(updated)
    return updated
  }
}
