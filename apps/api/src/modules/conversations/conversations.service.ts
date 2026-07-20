import { Injectable } from '@nestjs/common'
import type { Conversation, ConversationType } from '@chat/contract'
import type { ClientSession } from 'mongoose'
import { isDuplicateKeyError } from '../../common/mongo/is.duplicate.key.error'
import { HttpAppError } from '../../errors/HttpAppError'
import { UsersService } from '../users/users.service'
import { ConversationsDbService } from './conversations.dbService'

export type CreateConversationInput = {
  type?: ConversationType
  title?: string
  participantIds?: string[]
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
    const type = input.type ?? 'user'
    if (type === 'assistant' || type === 'tutor') {
      return this.getOrCreateAiConversation(creatorId, type, input.title)
    }
    return this.createUserConversation(input, creatorId)
  }

  // Assistant/tutor conversations are singletons per user: reuse the existing one,
  // tolerating a concurrent create that won the unique-index race.
  private async getOrCreateAiConversation(
    creatorId: string,
    type: 'assistant' | 'tutor',
    title: string | undefined,
  ): Promise<Conversation> {
    const existing = await this.conversationsDbService.findOwnedByType(creatorId, type)
    if (existing !== undefined) {
      return existing
    }
    try {
      return await this.conversationsDbService.create({
        type,
        participantIds: [creatorId],
        lastMessagePreview: '',
        ...(title === undefined ? {} : { title }),
      })
    } catch (error) {
      const raced = isDuplicateKeyError(error)
        ? await this.conversationsDbService.findOwnedByType(creatorId, type)
        : undefined
      if (raced !== undefined) {
        return raced
      }
      throw error
    }
  }

  // Direct/group: every participant must exist, and a duplicate 1:1 is rejected.
  private async createUserConversation(
    input: CreateConversationInput,
    creatorId: string,
  ): Promise<Conversation> {
    const participantIds = [...new Set([...(input.participantIds ?? []), creatorId])]
    const existingIds = await this.usersService.findExistingIds(participantIds)
    const missingParticipantIds = participantIds.filter((id) => !existingIds.has(id))
    if (missingParticipantIds.length > 0) {
      throw HttpAppError.badRequest('One or more participants do not exist', {
        participantIds: missingParticipantIds,
      })
    }

    if (participantIds.length === 2) {
      const existing = await this.conversationsDbService.findDirectByParticipants(participantIds)
      if (existing !== undefined) {
        throw HttpAppError.conflict(
          'CONVERSATION_ALREADY_EXISTS',
          'A direct conversation for these participants already exists',
        )
      }
    }

    return this.conversationsDbService.create({
      type: 'user',
      participantIds,
      lastMessagePreview: '',
      ...(input.title === undefined ? {} : { title: input.title }),
    })
  }

  async assertParticipant(conversationId: string, requesterId: string): Promise<Conversation> {
    const conversation = await this.conversationsDbService.findById(conversationId)
    if (conversation === undefined) {
      throw HttpAppError.notFound('Conversation not found')
    }
    if (!conversation.participantIds.includes(requesterId)) {
      throw HttpAppError.forbidden('You are not a participant in this conversation')
    }

    return conversation
  }

  async recordMessageActivity(
    conversationId: string,
    lastMessagePreview: string,
    occurredAt: Date,
    session?: ClientSession,
  ): Promise<Conversation> {
    const updated = await this.conversationsDbService.updateLastMessage(
      conversationId,
      lastMessagePreview,
      occurredAt,
      session,
    )
    if (updated === undefined) {
      throw HttpAppError.notFound('Conversation not found')
    }

    return updated
  }
}
