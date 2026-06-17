import { Injectable } from '@nestjs/common'
import type { Conversation } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { UsersService } from '../users/users.service'
import { ConversationsDbService } from './conversations.dbService'

export type CreateConversationInput = {
  title?: string
  participantIds: string[]
}

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsDbService: ConversationsDbService,
    private readonly usersService: UsersService,
  ) {}

  listConversations(userId: string): Conversation[] {
    return this.conversationsDbService.listByParticipant(userId).sort((left, right) => {
      return Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
    })
  }

  createConversation(input: CreateConversationInput, creatorId: string): Conversation {
    const participantIds = [...new Set([...input.participantIds, creatorId])]
    const missingParticipantIds = participantIds.filter((participantId) => {
      return this.usersService.findById(participantId) === undefined
    })
    if (missingParticipantIds.length > 0) {
      throw AppError.badRequest('VALIDATION_ERROR', 'One or more participants do not exist', {
        participantIds: missingParticipantIds,
      })
    }

    if (participantIds.length === 2) {
      const existing = this.conversationsDbService.findDirectByParticipants(participantIds)
      if (existing !== undefined) {
        throw AppError.conflict(
          'CONVERSATION_ALREADY_EXISTS',
          'A direct conversation for these participants already exists',
        )
      }
    }

    const nowIso = new Date().toISOString()
    return this.conversationsDbService.create({
      participantIds,
      lastMessagePreview: '',
      updatedAt: nowIso,
      ...(input.title === undefined ? {} : { title: input.title }),
    })
  }

  // Authorization rule shared with MessagesModule: a missing conversation is a
  // 404; an existing conversation the caller is not a participant of is a 403
  // (never reveal someone else's chat).
  assertParticipant(conversationId: string, requesterId: string): Conversation {
    const conversation = this.conversationsDbService.findById(conversationId)
    if (conversation === undefined) {
      throw AppError.notFound('Conversation not found')
    }
    if (!conversation.participantIds.includes(requesterId)) {
      throw AppError.forbidden('You are not a participant in this conversation')
    }

    return conversation
  }

  recordMessageActivity(
    conversationId: string,
    lastMessagePreview: string,
    occurredAt: string,
  ): void {
    this.conversationsDbService.update(conversationId, {
      lastMessagePreview,
      updatedAt: occurredAt,
    })
  }
}
