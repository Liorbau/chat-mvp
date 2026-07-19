import { Injectable } from '@nestjs/common'
import type { AssistantSseEvent, Message } from '@chat/contract'
import { AppError } from '../../../errors/AppError'
import { ConversationsService } from '../../conversations/conversations.service'
import { MessagesService } from '../../messages/messages.service'
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
  ) {}

  // Authorize + persist the user message eagerly so errors surface as a normal
  // HTTP error before the controller flushes SSE headers, then hand back the
  // agent event stream.
  async execute(input: StreamAgentReplyInput): Promise<StreamAgentReplyResult> {
    const conversation = await this.conversationsService.assertParticipant(
      input.conversationId,
      input.requesterId,
    )
    if (conversation.type !== 'assistant' && conversation.type !== 'tutor') {
      throw AppError.badRequest(
        'VALIDATION_ERROR',
        'This endpoint is only for assistant or tutor conversations',
      )
    }

    const userMessage = await this.messagesService.sendMessage({
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
      }),
    }
  }
}
