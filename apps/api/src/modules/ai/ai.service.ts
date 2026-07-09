import { Inject, Injectable, Logger } from '@nestjs/common'
import {
  ASSISTANT_SENDER_ID,
  type AssistantSseEvent,
  type ConversationType,
  type Message,
} from '@chat/contract'
import { AppError } from '../../errors/AppError'
import { ConversationsService } from '../conversations/conversations.service'
import { MessagesService } from '../messages/messages.service'
import { ConversationMemoryService } from './conversation.memory.service'
import {
  LLM_PROVIDER,
  type LlmProvider,
  type LlmMessage,
  type LlmRequest,
  type LlmStopReason,
  type LlmToolUse,
} from './llm.provider'
import { ASSISTANT_SYSTEM_PROMPT } from './prompts/assistant.prompt'
import { AiToolsService } from './tools/ai.tools.service'

const HISTORY_TOKEN_BUDGET = 12000
const MAX_TOOL_ROUNDS = 5

type TurnInput = { conversationId: string; requesterId: string; content: string }

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly conversationMemory: ConversationMemoryService,
    @Inject(LLM_PROVIDER) private readonly llmProvider: LlmProvider,
    private readonly aiTools: AiToolsService,
  ) {}

  async prepareTurn(
    input: TurnInput,
  ): Promise<{ message: Message; conversationType: ConversationType }> {
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
    const { message } = await this.messagesService.createMessage(input)
    return { message, conversationType: conversation.type }
  }

  async *streamReply(input: Omit<TurnInput, 'content'>): AsyncGenerator<AssistantSseEvent> {
    try {
      const messages = await this.loadHistory(input.conversationId)
      const tools = this.aiTools.definitions()

      yield { type: 'status', state: 'thinking' }
      let assistantText = ''

      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        const isFinalRound = round === MAX_TOOL_ROUNDS - 1
        const result = yield* this.streamRound({
          system: ASSISTANT_SYSTEM_PROMPT,
          messages,
          tools: isFinalRound ? [] : tools,
        })
        assistantText += result.text

        if (isFinalRound || result.stopReason !== 'tool_use' || result.toolUses.length === 0) {
          break
        }

        yield { type: 'status', state: 'tool_call' }
        messages.push({ role: 'assistant', content: result.text, toolUses: result.toolUses })
        const results = await Promise.all(
          result.toolUses.map((toolUse) => this.aiTools.execute(toolUse, input.requesterId)),
        )
        messages.push({ role: 'tool', results })
      }

      if (assistantText.trim() === '') {
        yield { type: 'error', code: 'EMPTY_REPLY', message: 'The assistant returned no response.' }
        return
      }

      const message = await this.messagesService.appendAssistantMessage(
        input.conversationId,
        assistantText,
      )
      yield { type: 'done', messageId: message.id }
    } catch (error) {
      this.logger.error(`Assistant turn failed for conversation ${input.conversationId}`, error)
      yield { type: 'error', code: 'AI_ERROR', message: 'The assistant failed to respond.' }
    }
  }

  private async loadHistory(conversationId: string): Promise<LlmMessage[]> {
    const history = await this.conversationMemory.loadHistoryForConversation(
      conversationId,
      HISTORY_TOKEN_BUDGET,
      { assistantSenderId: ASSISTANT_SENDER_ID, systemPrompt: ASSISTANT_SYSTEM_PROMPT },
    )
    return history
      .filter((message) => message.role !== 'system')
      .map(
        (message): LlmMessage =>
          message.role === 'assistant'
            ? { role: 'assistant', content: message.content }
            : { role: 'user', content: message.content },
      )
  }

  private async *streamRound(
    request: LlmRequest,
  ): AsyncGenerator<
    AssistantSseEvent,
    { text: string; stopReason: LlmStopReason; toolUses: LlmToolUse[] }
  > {
    let text = ''
    let stopReason: LlmStopReason = 'end_turn'
    let toolUses: LlmToolUse[] = []
    for await (const event of this.llmProvider.streamReply(request)) {
      if (event.type === 'text') {
        text += event.text
        yield { type: 'token', value: event.text }
      } else {
        stopReason = event.stopReason
        toolUses = event.toolUses
      }
    }
    return { text, stopReason, toolUses }
  }
}
