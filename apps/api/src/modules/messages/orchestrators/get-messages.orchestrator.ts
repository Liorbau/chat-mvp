import { Injectable } from '@nestjs/common'
import type { GetMessagesResponse } from '@chat/contract'
import { ConversationsService } from '../../conversations/conversations.service'
import { MessagesService } from '../messages.service'

@Injectable()
export class GetMessagesOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  async execute(
    conversationId: string,
    requesterId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<GetMessagesResponse> {
    await this.conversationsService.assertParticipant(conversationId, requesterId)
    return this.messagesService.getPage(conversationId, cursor, limit)
  }
}
