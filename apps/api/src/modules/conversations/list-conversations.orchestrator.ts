import { Injectable } from '@nestjs/common'
import type { Conversation } from '@chat/contract'
import { ConversationsService } from './conversations.service'

@Injectable()
export class ListConversationsOrchestrator {
  constructor(private readonly conversationsService: ConversationsService) {}

  execute(userId: string): Promise<Conversation[]> {
    return this.conversationsService.listConversations(userId)
  }
}
