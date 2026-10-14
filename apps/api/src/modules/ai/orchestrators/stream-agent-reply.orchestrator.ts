import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { ASSISTANT_SENDER_ID, type AssistantSseEvent, type Message } from '@chat/contract'
import type { Connection } from 'mongoose'
import { AppError } from '../../../errors/AppError'
import { ConversationsService } from '../../conversations/conversations.service'
import { MessagesService, type NewMessage } from '../../messages/messages.service'
import { AgentService } from '../agent/agent.service'

type StreamAgentReplyInput = {
  conversationId: string
  requesterId: string
  content: string
}

type StreamAgentReplyResult = {
  userMessage: Message
  stream: AsyncGenerator<AssistantSseEvent>
}

@Injectable()
export class StreamAgentReplyOrchestrator {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly agentService: AgentService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  // Authorize and persist before the controller flushes SSE headers, so errors stay plain HTTP.
  async execute(input: StreamAgentReplyInput): Promise<StreamAgentReplyResult> {
    const conversation = await this.conversationsService.assertParticipant(
      input.conversationId,
      input.requesterId,
    )
    if (conversation.type !== 'assistant' && conversation.type !== 'tutor') {
      throw AppError.badRequest('This endpoint is only for assistant or tutor conversations')
    }

    const userMessage = await this.saveMessage({
      conversationId: input.conversationId,
      senderId: input.requesterId,
      content: input.content,
    })

    return {
      userMessage,
      stream: this.agentService.streamReply({
        conversationId: input.conversationId,
        requesterId: input.requesterId,
        conversationType: conversation.type,
        saveReply: ({ content, citations }) =>
          this.saveMessage({
            conversationId: input.conversationId,
            senderId: ASSISTANT_SENDER_ID,
            content,
            ...(citations.length > 0 ? { citations } : {}),
          }),
      }),
    }
  }

  private async saveMessage(message: NewMessage): Promise<Message> {
    return this.connection.transaction(async (session) => {
      const created = await this.messagesService.createMessage(message, session)
      await this.conversationsService.recordMessageActivity(
        message.conversationId,
        created.content,
        new Date(created.createdAt),
        session,
      )
      return created
    })
  }
}
