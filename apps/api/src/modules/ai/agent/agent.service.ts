import { type BaseMessage, coerceMessageLikeToMessage } from '@langchain/core/messages'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { BaseCheckpointSaver, CompiledStateGraph } from '@langchain/langgraph'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ASSISTANT_SENDER_ID, type AssistantSseEvent, type Message } from '@chat/contract'
import { AppError } from '../../../errors/AppError'
import { ConversationsService } from '../../conversations/conversations.service'
import { MessagesService } from '../../messages/messages.service'
import { ConversationMemoryService } from '../conversation.memory.service'
import { buildAgentGraph } from './agent.graph'
import { type AgentConversationType, type AgentStateType } from './agent.state'
import { createChatModel } from '../chat-model'
import { AGENT_CHECKPOINTER } from './checkpointer.provider'
import { streamToSse } from './stream-to-sse'
import { AgentToolsService } from './tools/agent-tools.service'

const HISTORY_TOKEN_BUDGET = 12000

type StreamInput = {
  conversationId: string
  requesterId: string
  conversationType: AgentConversationType
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)
  private readonly graph: CompiledStateGraph<AgentStateType, Partial<AgentStateType>>

  constructor(
    configService: ConfigService,
    tools: AgentToolsService,
    @Inject(AGENT_CHECKPOINTER) checkpointer: BaseCheckpointSaver,
    private readonly memory: ConversationMemoryService,
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
  ) {
    this.graph = buildAgentGraph({ chatModel: createChatModel(configService), tools, checkpointer })
  }

  async prepareTurn(input: {
    conversationId: string
    requesterId: string
    content: string
  }): Promise<{ message: Message; conversationType: AgentConversationType }> {
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
    const message = await this.messagesService.sendMessage({
      conversationId: input.conversationId,
      senderId: input.requesterId,
      content: input.content,
    })
    return { message, conversationType: conversation.type }
  }

  async *streamReply(input: StreamInput): AsyncGenerator<AssistantSseEvent> {
    const config: RunnableConfig = {
      configurable: { thread_id: input.conversationId, requesterId: input.requesterId },
    }
    try {
      const messages = await this.turnMessages(input.conversationId, config)
      const events = this.graph.streamEvents(
        {
          messages,
          conversationType: input.conversationType,
          requesterId: input.requesterId,
          conversationId: input.conversationId,
        },
        { ...config, version: 'v2' },
      )
      const streamedText = yield* streamToSse(events)
      yield* this.finish(input.conversationId, config, streamedText === '')
    } catch (error) {
      this.logger.error(`Agent turn failed for conversation ${input.conversationId}`, error)
      yield { type: 'error', code: 'AI_ERROR', message: 'The assistant failed to respond.' }
    }
  }

  // Warm thread: the checkpoint already holds prior turns, so feed only the new
  // user message. Cold thread: seed the full history from Mongo once.
  private async turnMessages(
    conversationId: string,
    config: RunnableConfig,
  ): Promise<BaseMessage[]> {
    const snapshot = await this.graph.getState(config)
    const checkpointed = snapshot.values.messages as BaseMessage[] | undefined
    const history = await this.memory.loadHistoryForConversation(
      conversationId,
      HISTORY_TOKEN_BUDGET,
      {
        assistantSenderId: ASSISTANT_SENDER_ID,
      },
    )
    if (checkpointed !== undefined && checkpointed.length > 0) {
      const latest = history.at(-1)
      return latest !== undefined ? [coerceMessageLikeToMessage(latest)] : []
    }
    return history.map((message) => coerceMessageLikeToMessage(message))
  }

  private async *finish(
    conversationId: string,
    config: RunnableConfig,
    nothingStreamed: boolean,
  ): AsyncGenerator<AssistantSseEvent> {
    const snapshot = await this.graph.getState(config)
    const answerMessage = snapshot.values.messages.at(-1)
    const finalText = answerMessage !== undefined ? answerMessage.text : ''
    // The refusal path answers without an LLM call, so stream its text here.
    if (nothingStreamed && finalText.length > 0) {
      yield { type: 'token', value: finalText }
    }
    const citations = snapshot.values.citations
    const persisted = await this.messagesService.appendAssistantMessage(
      conversationId,
      finalText,
      citations.length > 0 ? citations : undefined,
    )
    yield citations.length > 0
      ? { type: 'done', messageId: persisted.id, citations }
      : { type: 'done', messageId: persisted.id }
  }
}
