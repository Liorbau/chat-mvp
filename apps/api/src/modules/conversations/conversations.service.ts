import { Injectable } from '@nestjs/common'
import type { Conversation } from '@chat/contract'
import type { ClientSession } from 'mongoose'
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

  async listConversations(userId: string): Promise<Conversation[]> {
    // Already sorted by last activity (lastMessageAt desc) via the DB index.
    return this.conversationsDbService.listByParticipant(userId)
  }

  async createConversation(
    input: CreateConversationInput,
    creatorId: string,
  ): Promise<Conversation> {
    const participantIds = [...new Set([...input.participantIds, creatorId])]
    const participantChecks = await Promise.all(
      participantIds.map(async (participantId) => ({
        participantId,
        exists: (await this.usersService.findById(participantId)) !== undefined,
      })),
    )
    const missingParticipantIds = participantChecks
      .filter((check) => !check.exists)
      .map((check) => check.participantId)
    if (missingParticipantIds.length > 0) {
      throw AppError.badRequest('VALIDATION_ERROR', 'One or more participants do not exist', {
        participantIds: missingParticipantIds,
      })
    }

    if (participantIds.length === 2) {
      const existing = await this.conversationsDbService.findDirectByParticipants(participantIds)
      if (existing !== undefined) {
        throw AppError.conflict(
          'CONVERSATION_ALREADY_EXISTS',
          'A direct conversation for these participants already exists',
        )
      }
    }

    return this.conversationsDbService.create({
      participantIds,
      lastMessagePreview: '',
      ...(input.title === undefined ? {} : { title: input.title }),
    })
  }

  async assertParticipant(conversationId: string, requesterId: string): Promise<Conversation> {
    const conversation = await this.conversationsDbService.findById(conversationId)
    if (conversation === undefined) {
      throw AppError.notFound('Conversation not found')
    }
    if (!conversation.participantIds.includes(requesterId)) {
      throw AppError.forbidden('You are not a participant in this conversation')
    }

    return conversation
  }

  async recordMessageActivity(
    conversationId: string,
    lastMessagePreview: string,
    occurredAt: Date,
    session?: ClientSession,
  ): Promise<void> {
    await this.conversationsDbService.updateLastMessage(
      conversationId,
      lastMessagePreview,
      occurredAt,
      session,
    )
  }
}
