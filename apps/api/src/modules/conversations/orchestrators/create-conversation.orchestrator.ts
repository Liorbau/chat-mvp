import { Injectable } from '@nestjs/common'
import type { Conversation } from '@chat/contract'
import { ConversationsService } from '../conversations.service'
import type { CreateConversationDto } from '../dto/create.conversation.dto'

@Injectable()
export class CreateConversationOrchestrator {
  constructor(private readonly conversationsService: ConversationsService) {}

  execute(dto: CreateConversationDto, userId: string): Promise<Conversation> {
    return this.conversationsService.createConversation(dto, userId)
  }
}
