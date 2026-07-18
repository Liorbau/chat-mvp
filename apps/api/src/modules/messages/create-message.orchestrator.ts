import { Injectable } from '@nestjs/common'
import type { SendMessageResponse } from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { ConversationsService } from '../conversations/conversations.service'
import { MessagesService } from './messages.service'

@Injectable()
export class CreateMessageOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  async execute(
    conversationId: string,
    requesterId: string,
    content: string,
  ): Promise<SendMessageResponse> {
    const conversation = await this.conversationsService.assertParticipant(
      conversationId,
      requesterId,
    )
    // The plain message endpoint is for human conversations; assistant/tutor
    // sends go through the AI endpoint.
    if (conversation.type === 'assistant') {
      throw AppError.badRequest(
        'VALIDATION_ERROR',
        'Use the assistant endpoint to message an assistant conversation',
      )
    }

    const message = await this.messagesService.sendMessage({
      conversationId,
      senderId: requesterId,
      content,
    })
    return { message }
  }
}
