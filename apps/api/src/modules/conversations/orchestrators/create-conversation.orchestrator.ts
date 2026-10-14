import { Injectable } from '@nestjs/common'
import type { Conversation } from '@chat/contract'
import { UsersService } from '../../users/users.service'
import { ConversationsService } from '../conversations.service'
import type { CreateConversationDto } from '../dto/create.conversation.dto'
import { participantIdsFor } from '../lib/conversations.participants'

@Injectable()
export class CreateConversationOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService,
  ) {}

  async execute(dto: CreateConversationDto, userId: string): Promise<Conversation> {
    const existingUserIds = await this.usersService.findExistingIds(participantIdsFor(dto, userId))
    return this.conversationsService.createConversation(dto, userId, existingUserIds)
  }
}
