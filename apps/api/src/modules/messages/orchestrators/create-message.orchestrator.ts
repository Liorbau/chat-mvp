import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import type { SendMessageResponse } from '@chat/contract'
import type { Connection } from 'mongoose'
import { AppError } from '../../../errors/AppError'
import { ConversationsService } from '../../conversations/conversations.service'
import { MessagesService } from '../messages.service'

@Injectable()
export class CreateMessageOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    @InjectConnection() private readonly connection: Connection,
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
    if (conversation.type !== 'user') {
      throw AppError.badRequest('Use the AI endpoint to message an assistant or tutor conversation')
    }

    const message = await this.connection.transaction(async (session) => {
      const created = await this.messagesService.createMessage(
        { conversationId, senderId: requesterId, content },
        session,
      )
      await this.conversationsService.recordMessageActivity(
        conversationId,
        created.content,
        new Date(created.createdAt),
        session,
      )
      return created
    })
    return { message }
  }
}
