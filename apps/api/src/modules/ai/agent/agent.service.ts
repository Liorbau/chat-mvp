import { type BaseMessage, coerceMessageLikeToMessage } from '@langchain/core/messages'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { BaseCheckpointSaver, CompiledStateGraph } from '@langchain/langgraph'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AssistantSseEvent } from '@chat/contract'
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
  ) {
    this.graph = buildAgentGraph({ chatModel: createChatModel(configService), tools, checkpointer })
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

  private async turnMessages(
    conversationId: string,
    config: RunnableConfig,
  ): Promise<BaseMessage[]> {
    const snapshot = await this.graph.getState(config)
    const checkpointed = snapshot.values.messages as BaseMessage[] | undefined
    const isWarm = !!checkpointed && checkpointed.length > 0
    const history = await this.memory.historyForTurn(conversationId, HISTORY_TOKEN_BUDGET, isWarm)
    return history.map((message) => coerceMessageLikeToMessage(message))
  }

  private async *finish(
    conversationId: string,
    config: RunnableConfig,
    nothingStreamed: boolean,
  ): AsyncGenerator<AssistantSseEvent> {
    const snapshot = await this.graph.getState(config)
    const answerMessage = snapshot.values.messages.at(-1)
    const finalText = answerMessage ? answerMessage.text : ''
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
