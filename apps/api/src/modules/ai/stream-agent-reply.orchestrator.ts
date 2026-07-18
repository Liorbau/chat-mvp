import { Injectable } from '@nestjs/common'
import type { AssistantSseEvent, Message } from '@chat/contract'
import { AgentService } from './agent/agent.service'

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
  constructor(private readonly agentService: AgentService) {}

  // prepareTurn runs eagerly so authorization/validation errors surface as a
  // normal HTTP error before the controller flushes SSE headers.
  async execute(input: StreamAgentReplyInput): Promise<StreamAgentReplyResult> {
    const { message, conversationType } = await this.agentService.prepareTurn(input)
    return {
      userMessage: message,
      stream: this.agentService.streamReply({
        conversationId: input.conversationId,
        requesterId: input.requesterId,
        conversationType,
      }),
    }
  }
}
